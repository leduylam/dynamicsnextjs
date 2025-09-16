import Button from "@components/ui/button";
import Logo from "@components/ui/logo";
import { useForm } from "react-hook-form";
import { useUI } from "@contexts/ui.context";
import { useTranslation } from "next-i18next";
import PasswordInput from "@components/ui/password-input";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useResetPasswordMutation } from "@framework/auth/use-reset-password";

type FormValues = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setModalView, openModal, closeModal } = useUI();
  const { mutate: resetPassword, isPending } = useResetPasswordMutation();
  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    const { token, email } = router.query;
    if (token && email) {
      setValue("token", token as string);
      setValue("email", email as string);
    }
  }, [router]);

  function handleSignIn() {
    setModalView("LOGIN_VIEW");
    return openModal();
  }

  const onSubmit = (values: FormValues) => {
    resetPassword(values);
  };

  return (
    <div className="py-6 px-5 sm:p-8 bg-white mx-auto rounded-lg w-full sm:w-96 md:w-450px border border-gray-300">
      <div className="text-center mb-9 pt-2.5">
        <div onClick={closeModal}>
          <Logo />
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center"
        noValidate
      >
        <div className="flex flex-col space-y-4">
          <input type="hidden" {...register("email", { required: true })} />
          <input type="hidden" {...register("token", { required: true })} />
          <PasswordInput
            labelKey={`${t("forms:label-new-password")}`}
            errorKey={errors.password?.message}
            {...register("password", {
              required: `${t("forms:password-required")}`,
            })}
          />
          <PasswordInput
            labelKey={`${t("forms:label-confirm-password")}`}
            errorKey={errors.password_confirmation?.message}
            {...register("password_confirmation", {
              required: `${t("forms:password-confirm-required")}`,
              validate: (value) =>
                value === watch("password") || t("forms:password-not-match"),
            })}
          />
        </div>
        <Button
          loading={isPending}
          disabled={isPending}
          type="submit"
          className="h-11 md:h-12 w-full mt-2"
        >
          {t("common:text-reset-password")}
        </Button>
      </form>
      <div className="flex flex-col items-center justify-center relative text-sm text-heading mt-8 sm:mt-10 mb-6 sm:mb-7">
        <hr className="w-full border-gray-300" />
        <span className="absolute -top-2.5 px-2 bg-white">
          {t("common:text-or")}
        </span>
      </div>
      <div className="text-sm sm:text-base text-body text-center">
        {t("common:text-back-to")}{" "}
        <button
          type="button"
          className="text-sm sm:text-base text-heading underline font-bold hover:no-underline focus:outline-none"
          onClick={handleSignIn}
        >
          {t("common:text-login")}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
