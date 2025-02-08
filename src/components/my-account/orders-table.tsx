import { motion } from 'framer-motion';
import { fadeInTop } from '@utils/motion/fade-in-top';
import Link from '@components/ui/link';
import { useWindowSize } from '@utils/use-window-size';
import { useSsrCompatible } from '@utils/use-ssr-compatible';
import { useOrdersQuery } from '@framework/order/get-all-orders';
import { number_format } from 'src/helpers/my-helper';
import { FaEye } from 'react-icons/fa';

const OrdersTable: React.FC = () => {
  const { width } = useSsrCompatible(useWindowSize(), { width: 0, height: 0 });
  const { data } = useOrdersQuery()
  return (
    <>
      <h2 className="mb-6 text-lg font-bold md:text-xl xl:text-2xl text-heading xl:mb-8">
        Orders
      </h2>
      <motion.div
        layout
        initial="from"
        animate="to"
        exit="from"
        //@ts-ignore
        variants={fadeInTop(0.35)}
        className={`w-full flex flex-col`}
      >
        {width >= 1025 ? (
          <table>
            <thead className="text-sm lg:text-base">
              <tr>
                <th className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right ltr:first:rounded-tl-md rtl:first:rounded-tr-md">
                  Order
                </th>
                <th className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right lg:text-center">
                  Date
                </th>
                <th className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right lg:text-center">
                  Status
                </th>
                <th className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right lg:text-center">
                  Memo
                </th>
                <th className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right lg:text-center">
                  Total
                </th>
                <th className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right ltr:lg:text-right rtl:lg:text-left ltr:last:rounded-tr-md rtl:last:rounded-tl-md">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm lg:text-base">
              {data && data.orders?.map((order: any) => (
                <tr className="border-b border-gray-300 last:border-b-0" key={order.id}>
                  <td className="px-4 py-5 ltr:text-left rtl:text-right">
                    <Link
                      href={'/my-account/orders/' + order.id}
                      className="underline hover:no-underline text-body"
                    >
                      {order.order_code}
                    </Link>
                  </td>
                  <td className="px-4 py-5 ltr:text-left rtl:text-right lg:text-center text-heading">
                    {order.created_at}
                  </td>
                  <td className="px-4 py-5 ltr:text-left rtl:text-right lg:text-center text-heading">
                    <span className={`${order.publish.className} inline-block px-2 rounded-md shadow-vendorCard text-sm font-semibold`}>{order.publish.name}</span>
                  </td>
                  <td className="px-4 py-5 ltr:text-left rtl:text-right lg:text-center text-heading">
                    {order.memo}
                  </td>
                  <td className="px-4 py-5 ltr:text-left rtl:text-right lg:text-center text-heading">
                    {number_format(order.grand_total)}
                  </td>
                  <td className="px-4 py-5 ltr:text-right rtl:text-left text-heading">
                    <Link
                      href={'/my-account/orders/' + order.id}
                      className="text-sm leading-4 bg-heading text-white px-4 py-2.5 inline-block rounded-md hover:text-white hover:bg-gray-600"
                    >
                      <FaEye />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="w-full space-y-4">
            {data && data.orders.map((order: any) => (
              <ul className="flex flex-col px-4 pt-5 pb-6 space-y-5 text-sm font-semibold border border-gray-300 rounded-md text-heading" key={order.id}>
                <li className="flex items-center justify-between">
                  Order
                  <span className="font-normal">
                    <Link
                      href={'/my-account/orders/' + order.id}
                      className="underline hover:no-underline text-body"
                    >
                      {order.order_code}
                    </Link>
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  Date
                  <span className="font-normal">{order.created_at}</span>
                </li>
                <li className="flex items-center justify-between">
                  Status
                  <span className="font-normal">{order.publish.name}</span>
                </li>
                <li className="flex items-center justify-between">
                  Total
                  <span className="font-normal">{number_format(order.grand_total)}</span>
                </li>
                <li className="flex items-center justify-between">
                  Note
                  <span className="font-normal">{order.memo}</span>
                </li>
                <li className="flex items-center justify-between">
                  Actions
                  <span className="font-normal">
                    <Link
                      href={'/my-account/orders/' + order.id}
                      className="text-sm leading-4 bg-heading text-white px-4 py-2.5 inline-block rounded-md hover:text-white hover:bg-gray-600"
                    >
                      View
                    </Link>
                  </span>
                </li>
              </ul>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default OrdersTable;
