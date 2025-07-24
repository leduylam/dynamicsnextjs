import Link from '@components/ui/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInOut } from '@utils/motion/fade-in-out';
import { IoIosCloseCircle } from 'react-icons/io';
import Counter from '@components/common/counter';
import { ROUTES } from '@utils/routes';
import { generateCartItemName } from '@utils/generate-cart-item-name';
import { useCartMutation } from '@framework/carts/use-cart';
import { number_format } from 'src/helpers/my-helper';
import { useClearItemFromCart } from '@framework/carts/get-delete-cart';
import { useRemoveItemFromCart } from '@framework/carts/get-remove-cart';

type CartItemProps = {
  item: any;
};
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { mutate: updateCart } = useCartMutation()
  const { mutate: clearItemFromCart } = useClearItemFromCart()
  const { mutate: removeItemFromCart } = useRemoveItemFromCart()
  const totalPrice = item.price * item.quantity
  return (
    <motion.div
      layout
      initial="from"
      animate="to"
      exit="from"
      variants={fadeInOut(0.25)}
      className={`group w-full h-auto flex justify-start items-center bg-white py-4 md:py-7 border-b border-gray-100 relative last:border-b-0`}
      title={item?.name}
    >
      <div className="relative flex flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-200 rounded-md cursor-pointer md:w-28 md:h-28 ltr:mr-4 rtl:ml-4">
        <Image
          src={`${item?.image}` || '/assets/placeholder/cart-item.svg'}
          width={112}
          height={112}
          loading="eager"
          alt={item.name || 'Product Image'}
          className="object-cover bg-gray-300"
        />
        <div
          className="absolute top-0 flex items-center justify-center w-full h-full transition duration-200 ease-in-out bg-black ltr:left-0 rtl:right-0 bg-opacity-30 md:bg-opacity-0 md:group-hover:bg-opacity-30"
          onClick={() => clearItemFromCart(item.id)}
          role="button"
        >
          <IoIosCloseCircle className="relative text-2xl text-white transition duration-300 ease-in-out transform md:scale-0 md:opacity-0 md:group-hover:scale-100 md:group-hover:opacity-100" />
        </div>
      </div>

      <div className="flex flex-col w-full overflow-hidden">
        <Link
          href={`${ROUTES.PRODUCT}/${item?.slug}`}
          className="truncate text-sm text-heading mb-1.5 -mt-1"
        >
          {generateCartItemName(item.name, item.attributes)}
        </Link>
        <span className='text-sm'>{item.sku}</span>
        {/* @ts-ignore */}
        <span className="text-sm text-gray-400 mb-2.5">
          Unit Price : &nbsp;
          {/* {price} */}
        </span>

        <div className="flex items-end justify-between">
          <Counter
            quantity={item.quantity}
            onIncrement={() => updateCart({ item, quantity: 1 })}
            onDecrement={() => removeItemFromCart({ id: item.id, quantity: 1 })}
            variant="dark"
          />
          <span className="text-sm font-semibold leading-5 md:text-base text-heading">
            {number_format(totalPrice || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
