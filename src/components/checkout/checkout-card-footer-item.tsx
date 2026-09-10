import { number_format } from "src/helpers/my-helper";

/**
 * Dòng tổng tiền của checkout card (`checkout-card.tsx`): id là số thứ tự dòng,
 * price là số tiền — trừ dòng Shipping có thể là chuỗi t("text-free"), và
 * subtotal/total còn `undefined` khi cart chưa nạp (render fallback 0).
 */
export type FooterItemProps = {
  id: number | string;
  name: string;
  price?: number | string;
};
export const CheckoutCardFooterItem: React.FC<{ item: FooterItemProps }> = ({
  item,
}) => {
  return (
    <div className="flex items-center py-4 lg:py-5 border-b border-gray-300 text-sm lg:px-3 w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
      {item.name}
      <span className="ltr:ml-auto rtl:mr-auto flex-shrink-0">
        {number_format(item.price || 0)}
      </span>
    </div>
  );
};
