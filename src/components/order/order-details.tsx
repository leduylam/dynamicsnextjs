import { useOrderQuery } from "@framework/order/get-order";
import { OrderItem } from "@framework/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { number_format } from "src/helpers/my-helper";

const OrderItemCard = ({ product }: { product: OrderItem }) => {
  return (
    <tr
      className="font-normal border-b border-gray-300 last:border-b-0"
      key={product.id}
    >
      <td className="p-4">
        {product.product_name} * {product.quantity}
      </td>
      <td className="p-4">{number_format(product.total)}</td>
    </tr>
  );
};

const OrderDetails: React.FC<{ className?: string }> = ({
  className = "pt-10 lg:pt-12",
}) => {
  const { t } = useTranslation("common");
  const {
    query: { id },
  } = useRouter();

  const orderId = Array.isArray(id) ? id[0] : id;
  const {
    data: order,
    isLoading,
    isFetching,
  } = useOrderQuery(orderId?.toString());

  if (!order && (isLoading || isFetching)) {
    return <p className={className}>{t("text-loading")}</p>;
  }

  if (!order) {
    return (
      <div className={className}>
        <h2 className="mb-6 text-lg font-bold md:text-xl xl:text-2xl text-heading xl:mb-8">
          {t("text-order-details")}:
        </h2>
        <p className="text-sm text-body">{t("text-order-not-found")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="mb-6 text-lg font-bold md:text-xl xl:text-2xl text-heading xl:mb-8">
        {t("text-order-details")}:
      </h2>
      <table className="w-full text-sm font-semibold text-heading lg:text-base">
        <thead>
          <tr>
            <th className="w-1/2 p-4 bg-gray-150 ltr:text-left rtl:text-right ltr:first:rounded-tl-md rtl:first:rounded-tr-md">
              {t("text-product")}
            </th>
            <th className="w-1/2 p-4 bg-gray-150 ltr:text-left rtl:text-right ltr:last:rounded-tr-md rtl:last:rounded-tl-md">
              {t("text-total")}
            </th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((product: OrderItem, index: number) => (
            <OrderItemCard key={index} product={product} />
          ))}
        </tbody>
        <tfoot>
          <tr className="odd:bg-gray-150">
            <td className="p-4 italic">{t("text-sub-total")}:</td>
            <td className="p-4">{number_format(order.subtotal)}</td>
          </tr>
          {order.discount_amount > 0 && (
            <tr className="odd:bg-gray-150">
              <td className="p-4 italic">{t("text-order-discount")}:</td>
              <td className="p-4">-{number_format(order.discount_amount)}</td>
            </tr>
          )}
          {order.tax_amount > 0 && (
            <tr className="odd:bg-gray-150">
              <td className="p-4 italic">{t("text-tax")}:</td>
              <td className="p-4">{number_format(order.tax_amount)}</td>
            </tr>
          )}
          <tr className="odd:bg-gray-150">
            <td className="p-4 italic">{t("text-shipping")}:</td>
            <td className="p-4">
              {order.shipping_amount > 0
                ? number_format(order.shipping_amount)
                : t("text-free")}
            </td>
          </tr>
          <tr className="odd:bg-gray-150">
            <td className="p-4 italic">{t("text-total")}:</td>
            <td className="p-4">{number_format(order.grand_total)}</td>
          </tr>
          <tr className="odd:bg-gray-150">
            <td className="p-4 italic">{t("text-note")}:</td>
            <td className="p-4">{order.memo}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderDetails;
