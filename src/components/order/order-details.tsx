import { useOrderQuery } from "@framework/order/get-order";
import { OrderItem } from "@framework/types";
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
    return <p className={className}>Loading...</p>;
  }

  if (!order) {
    return (
      <div className={className}>
        <h2 className="mb-6 text-lg font-bold md:text-xl xl:text-2xl text-heading xl:mb-8">
          Order Details:
        </h2>
        <p className="text-sm text-body">
          We could not find details for this order. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="mb-6 text-lg font-bold md:text-xl xl:text-2xl text-heading xl:mb-8">
        Order Details:
      </h2>
      <table className="w-full text-sm font-semibold text-heading lg:text-base">
        <thead>
          <tr>
            <th className="w-1/2 p-4 bg-gray-150 ltr:text-left rtl:text-right ltr:first:rounded-tl-md rtl:first:rounded-tr-md">
              Product
            </th>
            <th className="w-1/2 p-4 bg-gray-150 ltr:text-left rtl:text-right ltr:last:rounded-tr-md rtl:last:rounded-tl-md">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((product, index) => (
            <OrderItemCard key={index} product={product} />
          ))}
        </tbody>
        <tfoot>
          <tr className="odd:bg-gray-150">
            <td className="p-4 italic"> Sub total:</td>
            <td className="p-4">{order.grand_total}</td>
          </tr>
          <tr className="odd:bg-gray-150">
            <td className="p-4 italic">Total:</td>
            <td className="p-4">{order.grand_total}</td>
          </tr>
          <tr className="odd:bg-gray-150">
            <td className="p-4 italic">Note:</td>
            <td className="p-4">{order.memo}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderDetails;
