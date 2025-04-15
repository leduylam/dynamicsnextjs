import Input from '@components/ui/input';
import PasswordInput from '@components/ui/password-input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import Logo from '@components/ui/logo';
import { useSignUpMutation, SignUpInputType } from '@framework/auth/use-signup';
import Link from '@components/ui/link';
import { ROUTES } from '@utils/routes';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

const SignUpForm: React.FC = () => {
    const { t } = useTranslation();
    const { mutate: signUp, isPending } = useSignUpMutation();
    const {
        register,
        handleSubmit,
        watch,
        setError,
        reset,
        formState: { errors },
    } = useForm<SignUpInputType>();
    const [successMessage, setSuccessMessage] = useState<string | null>()
    function onSubmit({ name, email, password, confirmPassword }: SignUpInputType) {
        signUp({
            name,
            email,
            password,
            confirmPassword
        },
            {
                onSuccess: (data: any) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setSuccessMessage(data.data.message)
                    reset()
                },
                onError: (error: any) => {
                    const message = error?.response?.data?.message;
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                    if (message.includes("Email")) {
                        setError("email", {
                            type: "manual",
                            message: "Email đã tồn tại, vui lòng ấn 'Quên mật khẩu'",
                        });
                    } else {
                        setError("root", {
                            type: "manual",
                            message: message,
                        });
                    }
                }
            }
        );
    }
    return (
        <div className="py-5 px-5 sm:px-8 bg-white mx-auto rounded-lg w-full sm:w-96 md:w-450px border border-gray-300">
            <div className="text-center mb-6 pt-2.5">
                <div>
                    <Logo />
                </div>
                <p className="text-sm md:text-base text-body mt-2 mb-8 sm:mb-10">
                    {t('common:registration-helper')}{' '}
                    <Link
                        href={ROUTES.TERMS}
                        className="text-heading underline hover:no-underline focus:outline-none"
                    >
                        {t('common:text-terms')}
                    </Link>{' '}
                    &amp;{' '}
                    <Link
                        href={ROUTES.POLICY}
                        className="text-heading underline hover:no-underline focus:outline-none"
                    >
                        {t('common:text-policy')}
                    </Link>
                </p>
                {successMessage && (
                    <div className="text-sm text-green-600 text-center italic mt-2">
                        {successMessage}
                    </div>
                )}
                {errors.root && (
                    <div className="text-sm text-red-600 text-center italic mt-2">
                        {errors.root.message}
                    </div>
                )}
            </div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col justify-center"
                noValidate
            >
                <div className="flex flex-col space-y-4">
                    <Input
                        labelKey={t('forms:label-name')}
                        type="text"
                        variant="solid"
                        {...register('name', {
                            required: `${t('forms:name-required')}`,
                        })}
                        errorKey={errors.name?.message}
                    />
                    <Input
                        labelKey={t('forms:label-email')}
                        type="email"
                        variant="solid"
                        {...register('email', {
                            required: `${t('forms:email-required')}`,
                            pattern: {
                                value:
                                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: t('forms:email-error'),
                            },
                        })}
                        errorKey={errors.email?.message}
                    />
                    <PasswordInput
                        labelKey={t('forms:label-password')}
                        errorKey={errors.password?.message}
                        {...register('password', {
                            required: `${t('forms:password-required')}`,
                        })}
                    />
                    <PasswordInput
                        labelKey="Confirm Password"
                        errorKey={errors.confirmPassword?.message}
                        {...register("confirmPassword", {
                            required: "Confirm Password",
                            validate: (value) => value === watch('password') || "Passwords do not match",
                        })}
                        className="mb-4"
                    />
                    <div className="relative">
                        <Button
                            type="submit"
                            loading={isPending}
                            disabled={isPending}
                            className="h-11 md:h-12 w-full mt-2"
                        >
                            {t('common:text-register')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SignUpForm;
