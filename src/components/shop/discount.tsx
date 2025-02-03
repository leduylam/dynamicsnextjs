import { useState } from 'react';
import Container from '@components/ui/container';
import { IoClose } from 'react-icons/io5';

const ShopDiscount: React.FC = () => {
  const [status, setStatus] = useState(false);
  const hide = () => {
    setStatus(true);
  };
  return (
    <div
      className={`flex justify-center relative bg-borderBottom transition duration-200 ease-in ${status === true ? 'h-0.5' : 'py-4'
        }`}
    >
      <Container className={status === true ? 'opacity-0 invisible' : 'w-full'}>
        <div className="relative text-center text-heading text-xs md:text-sm leading-6 md:leading-7 px-8">
          Discount &nbsp;
          <a className="underline" href="#">
            Details
          </a>
          <button
            className="absolute h-full ltr:right-0 rtl:left-0 top-0 flex text-lg md:text-2xl items-center justify-center text-gray-500 opacity-50 focus:outline-none transition-opacity hover:opacity-100"
            onClick={hide}
            aria-label="close"
          >
            <IoClose className="text-black" />
          </button>
        </div>
      </Container>
    </div>
  );
};

export default ShopDiscount;
