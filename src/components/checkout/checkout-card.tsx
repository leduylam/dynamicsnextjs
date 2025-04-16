
import { CheckoutItem } from "@components/checkout/checkout-card-item";
import { CheckoutCardFooterItem } from "./checkout-card-footer-item";
import { useEffect, useState } from "react";
import { useCartQuery } from "@framework/carts/get-all-cart";

const CheckoutCard: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { data } = useCartQuery()
  const items = data?.items
  const checkoutFooter = [
    {
      id: 1,
      name: "Subtotal",
      price: data?.total,
    },
    {
      id: 3,
      name: "Total",
      price: data?.total,
    },
  ];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return;
  return (
    <div className="pt-12 md:pt-0 ltr:2xl:pl-4 rtl:2xl:pr-4">
      <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
        Your Order
      </h2>
      <div className="flex p-4 rounded-md mt-6 md:mt-7 xl:mt-9 bg-gray-150 text-sm font-semibold text-heading">
        <span>Product</span>
        <span className="ltr:ml-auto rtl:mr-auto flex-shrink-0">
          Subtotal
        </span>
      </div>
      {items?.map((item) => <CheckoutItem item={item} key={item.id} />)}
      {/* {isEmpty && (
        <p className="text-red-500 lg:px-3 py-4">{t("text-empty-cart")}</p>
      )} */}
      {checkoutFooter.map((item: any) => (
        <CheckoutCardFooterItem item={item} key={item.id} />
      ))}
    </div>
  );
};

export default CheckoutCard;
