import CartIcon from '@components/icons/cart-icon';
import { useUI } from '@contexts/ui.context';
import { useCartQuery } from '@framework/carts/get-all-cart';

export default function CartButton() {
  const { openCart, isAuthorized } = useUI();
  const { data } = useCartQuery({
    enabled: isAuthorized,
  });
  const totalItems = data?.totalItems
  function handleCartOpen() {
    return openCart();
  }
  return (
    <button
      className="relative flex items-center justify-center flex-shrink-0 h-auto transform focus:outline-none"
      onClick={handleCartOpen}
      aria-label="cart-button"
    >
      <CartIcon />
      <span className="cart-counter-badge flex items-center justify-center bg-heading text-white absolute -top-2.5 xl:-top-3 rounded-full ltr:-right-2.5 ltr:xl:-right-3 rtl:-left-2.5 rtl:xl:-left-3 font-bold">
        {totalItems}
      </span>
    </button>
  );
}
