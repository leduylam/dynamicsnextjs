import Input from '@components/ui/input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { fadeInTop } from '@utils/motion/fade-in-top';
import {
  useUpdateUserMutation,
  UpdateUserType,
} from '@framework/customer/use-update-customer';
import { useAuth } from '@contexts/auth/auth-context';
const defaultValues = {};


const AccountDetails: React.FC = () => {
  const authContext = useAuth();
  const user = authContext ? authContext.user : null;
  const { mutate: updateUser, isPending } = useUpdateUserMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserType>({
    defaultValues,
  });
  function onSubmit(input: UpdateUserType) {
    updateUser(input);
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
        Account Details
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto flex flex-col justify-center "
        noValidate
      >
        <div className="flex flex-col space-y-4 sm:space-y-5">
          <Input
            labelKey="Name"
            value={user?.name! ?? ''}
            {...register('name', {
              required: 'forms:display-name-required',
            })}
            variant="solid"
            errorKey={errors.name?.message}
          />
          <div className="flex flex-col sm:flex-row sm:gap-x-3 space-y-4 sm:space-y-0">
            <Input
              type="tel"
              labelKey="Phone"
              value={user?.phone! ?? ''}
              {...register('phone', {
                required: 'forms:phone-required',
              })}
              variant="solid"
              className="w-full sm:w-1/2"
              errorKey={errors.phone?.message}
            />
            <Input
              type="email"
              labelKey="Email"
              value={user?.email! ?? ''}
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
          <div className="flex flex-col sm:flex-row sm:gap-x-3 space-y-4 sm:space-y-0">
            <Input
              type="text"
              labelKey="Address"
              value={user?.address! ?? ''}
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
              Save
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AccountDetails;
