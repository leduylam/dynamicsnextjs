
import { CheckoutItem } from "@components/checkout/checkout-card-item";
import { CheckoutCardFooterItem } from "./checkout-card-footer-item";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useCartQuery } from "@framework/carts/get-all-cart";

const CheckoutCard: React.FC = () => {
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);
  const { data } = useCartQuery()
  const items = data?.items
  // Dòng tiền lấy thẳng từ cart API (`ApiCart`): Subtotal là NET (trước VAT) nên
  // KHÔNG dùng lại `total` — `total` là GROSS, đã trừ giảm giá, cộng thuế và ship.
  // Giảm giá/thuế chỉ hiện khi có, để tổng luôn cộng đúng từ các dòng hiển thị.
  const discount = Number(data?.discount_amount ?? 0);
  const tax = Number(data?.tax_amount ?? 0);
  const shipping = Number(data?.shipping_amount ?? 0);
  const checkoutFooter = [
    {
      id: 1,
      name: t("text-sub-total"),
      price: data?.subtotal,
    },
    ...(discount > 0
      ? [
          {
            id: 2,
            name: t("text-order-discount"),
            price: -discount,
          },
        ]
      : []),
    ...(tax > 0
      ? [
          {
            id: 3,
            name: t("text-tax"),
            price: tax,
          },
        ]
      : []),
    {
      id: 4,
      name: t("text-shipping"),
      price: shipping > 0 ? shipping : t("text-free"),
    },
    {
      id: 5,
      name: t("text-total"),
      price: data?.total,
    },
  ];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return (
    <div className="pt-12 md:pt-0 ltr:2xl:pl-4 rtl:2xl:pr-4">
      <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
        {t("text-your-order")}
      </h2>
      <div className="flex p-4 rounded-md mt-6 md:mt-7 xl:mt-9 bg-gray-150 text-sm font-semibold text-heading">
        <span>{t("text-product")}</span>
        <span className="ltr:ml-auto rtl:mr-auto flex-shrink-0">
          {t("text-sub-total")}
        </span>
      </div>
      {items?.map((item) => <CheckoutItem item={item} key={item.id} />)}
      {/* {isEmpty && (
        <p className="text-red-500 lg:px-3 py-4">{t("text-empty-cart")}</p>
      )} */}
      {checkoutFooter.map((item) => (
        <CheckoutCardFooterItem item={item} key={item.id} />
      ))}
    </div>
  );
};

export default CheckoutCard;
