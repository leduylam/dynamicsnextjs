import Input from '@components/ui/input';
import PasswordInput from '@components/ui/password-input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import { useLoginMutation, LoginInputType } from '@framework/auth/use-login';
import { useUI } from '@contexts/ui.context';
import Logo from '@components/ui/logo';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { setModalView, openModal, closeModal } = useUI();
  const [_, setError] = useState<string | null>(null);
  const { mutate: login, isPending } = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputType>();

  function onSubmit({ email, password, remember_me }: LoginInputType) {
    try {
      login({
        email,
        password,
        remember_me,
      });
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    }
  }
  function handleForgetPassword() {
    setModalView('FORGET_PASSWORD');
    return openModal();
  }
  return (
    <div className="w-full px-5 py-5 mx-auto overflow-hidden bg-white border border-gray-300 rounded-lg sm:w-96 md:w-450px sm:px-8">
      <div className="text-center mb-6 pt-2.5">
        <div onClick={closeModal}>
          <Logo />
        </div>
        <p className="mt-2 mb-8 text-sm md:text-base text-body sm:mb-10">
          Login with your email & password
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center"
        noValidate
      >
        <div className="flex flex-col space-y-3.5">
          <Input
            labelKey="Email"
            type="email"
            variant="solid"
            {...register('email', {
              required: `Email is required`,
              pattern: {
                value:
                  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: 'Please provide valid email address',
              },
            })}
            errorKey={errors.email?.message}
          />
          <PasswordInput
            labelKey="Password"
            errorKey={errors.password?.message}
            {...register('password', {
              required: `Password is required`,
            })}
          />
          <div className="flex items-center justify-center">
            <div className="flex items-center flex-shrink-0">
              <label className="relative inline-block w-10 cursor-pointer switch">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-0 h-0 opacity-0"
                  {...register('remember_me')}
                />
                <span className="absolute inset-0 transition-all duration-300 ease-in bg-gray-500 slider round"></span>
              </label>
              <label
                htmlFor="remember"
                className="flex-shrink-0 text-sm cursor-pointer text-heading ltr:pl-3 rtl:pr-3"
              >
                Remember me
              </label>
            </div>
            <div className="flex ltr:ml-auto rtl:mr-auto">
              <button
                type="button"
                onClick={handleForgetPassword}
                className="text-sm underline ltr:text-right rtl:text-left text-heading ltr:pl-3 rtl:pr-3 hover:no-underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
          </div>
          <div className="relative">
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending}
              className="h-11 md:h-12 w-full mt-1.5"
            >
              Login
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
