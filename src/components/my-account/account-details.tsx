import Input from '@components/ui/input';
import PasswordInput from '@components/ui/password-input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { fadeInTop } from '@utils/motion/fade-in-top';
import {
  useUpdateUserMutation,
  UpdateUserType,
} from '@framework/customer/use-update-customer';
import { useAuth } from '@contexts/auth/auth-context';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { isAxiosError } from 'axios';

const EMPTY: UpdateUserType = { name: '', phone: '', email: '', address: '', current_password: '' };

/**
 * Hồ sơ khách — lưu thật qua `PUT /api/auth/jwt/profile` (2026-09-29; trước đó form không gọi API và
 * mỗi ô bị ghim `value` nên không gõ được). Đổi email ⇒ hiện ô mật khẩu hiện tại (BE bắt buộc).
 */
const AccountDetails: React.FC = () => {
  const { t } = useTranslation();
  const authContext = useAuth();
  const user = authContext ? authContext.user : null;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<UpdateUserType>({ defaultValues: EMPTY });

  const { mutate: updateUser, isPending } = useUpdateUserMutation((saved) => {
    authContext?.updateUserFields(saved);
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      address: user.address ?? '',
      current_password: '',
    });
  }, [user, reset]);

  const emailChanged =
    !!user && (watch('email') ?? '').trim().toLowerCase() !== (user.email ?? '').toLowerCase();

  function onSubmit(input: UpdateUserType) {
    updateUser(
      { ...input, current_password: emailChanged ? input.current_password : undefined },
      {
        onError: (error) => {
          const fieldErrors = isAxiosError(error) ? error.response?.data?.errors : undefined;
          if (fieldErrors?.current_password?.[0]) {
            setError('current_password', { message: fieldErrors.current_password[0] });
          }
          if (fieldErrors?.email?.[0]) {
            setError('email', { message: fieldErrors.email[0] });
          }
        },
      },
    );
  }

  return (
    <motion.div
      layout
      initial="from"
      animate="to"
      exit="from"
      //@ts-ignore
      variants={fadeInTop(0.35)}
      className={`w-full flex flex-col`}
    >
      <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
        {t('common:text-account-details')}
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto flex flex-col justify-center "
        noValidate
      >
        <div className="flex flex-col space-y-4 sm:space-y-5">
          <Input
            labelKey={t('forms:label-name')}
            {...register('name', {
              required: 'forms:display-name-required',
            })}
            variant="solid"
            errorKey={errors.name?.message}
          />
          <div className="flex flex-col sm:flex-row sm:gap-x-3 space-y-4 sm:space-y-0">
            <Input
              type="tel"
              labelKey={t('forms:label-phone')}
              {...register('phone', {
                required: 'forms:phone-required',
              })}
              variant="solid"
              className="w-full sm:w-1/2"
              errorKey={errors.phone?.message}
            />
            <Input
              type="email"
              labelKey={t('forms:label-email')}
              {...register('email', {
                required: 'forms:email-required',
                pattern: {
                  value:
                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: 'forms:email-error',
                },
              })}
              variant="solid"
              className="w-full sm:w-1/2"
              errorKey={errors.email?.message}
            />
          </div>
          {emailChanged ? (
            <PasswordInput
              labelKey={t('forms:label-current-password-for-email')}
              {...register('current_password', {
                required: 'forms:current-password-required',
              })}
              errorKey={errors.current_password?.message}
            />
          ) : null}
          <div className="flex flex-col sm:flex-row sm:gap-x-3 space-y-4 sm:space-y-0">
            <Input
              type="text"
              labelKey={t('forms:label-address')}
              {...register('address', {
                required: 'forms:address-required',
              })}
              variant="solid"
              className="w-full"
              errorKey={errors.address?.message}
            />
          </div>
          <div className="relative">
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending}
              className="h-12 mt-3 w-full sm:w-32"
            >
              {t('common:button-save')}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AccountDetails;
