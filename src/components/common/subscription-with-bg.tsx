import Text from '@components/ui/text';
import Input from '@components/ui/input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { getDirection } from '@utils/get-direction';

const data = {
  title: 'common:text-subscribe-heading',
  description: 'common:text-subscribe-description',
  buttonText: 'common:button-subscribe',
};

interface Props {
  className?: string;
}

type FormValues = {
  subscription_email: string;
};

const defaultValues = {
  subscription_email: '',
};

const SubscriptionWithBg: React.FC<Props> = ({
  className = 'px-5 sm:px-8 md:px-16 2xl:px-24',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
  });
  const { locale } = useRouter();
  const dir = getDirection(locale);
  const { title, description, buttonText } = data;
  async function onSubmit(input: FormValues) {
    console.log(input, 'data');
  }
  return (
    <div
      className={`${className} relative overflow-hidden flex flex-col sm:items-center xl:items-start rounded-lg bg-gray-200 py-10 md:py-14 lg:py-16`}
    >
      <div className="-mt-1.5 lg:-mt-2 xl:-mt-0.5 text-center ltr:xl:text-left rtl:xl:text-right mb-7 md:mb-8 lg:mb-9 xl:mb-0">
        <Text
          variant="mediumHeading"
          className="mb-2 md:mb-2.5 lg:mb-3 xl:mb-3.5"
        >
          {`${title}`}
        </Text>
        <p className="text-xs leading-6 text-body md:text-sm md:leading-7">
          {`${description}`}
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-shrink-0 w-full sm:w-96 md:w-[545px] md:mt-7 z-10"
        noValidate
      >
        <div className="flex flex-col items-start justify-end sm:flex-row">
          <Input
            placeholderKey="forms:placeholder-email-subscribe"
            type="email"
            variant="solid"
            className="w-full"
            inputClassName="px-4 lg:px-7 h-12 lg:h-14 text-center ltr:sm:text-left rtl:sm:text-right bg-white"
            {...register('subscription_email', {
              required: 'forms:email-required',
              pattern: {
                value:
                  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: 'forms:email-error',
              },
            })}
            errorKey={errors.subscription_email?.message}
          />
          <Button className="flex-shrink-0 w-full mt-3 sm:mt-0 sm:w-auto ltr:sm:ml-2 rtl:sm:mr-2 md:h-full">
            <span className="lg:py-0.5">{`${buttonText}`}</span>
          </Button>
        </div>
      </form>
      <div
        style={{
          backgroundImage:
            dir === 'rtl'
              ? 'url(/assets/images/subscription-bg-reverse.png)'
              : 'url(/assets/images/subscription-bg.png)',
        }}
        className={`hidden z-0 xl:block bg-no-repeat ${dir === 'rtl'
            ? 'bg-left 2xl:-left-12 3xl:left-0'
            : 'bg-right xl:-right-24 2xl:-right-20 3xl:right-0'
          } bg-contain xl:bg-cover 3xl:bg-contain absolute h-full w-full top-0`}
      />
    </div>
  );
};

export default SubscriptionWithBg;
