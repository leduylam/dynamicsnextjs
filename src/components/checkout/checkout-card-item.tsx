import { Item } from "@contexts/cart/cart.utils";
import { generateCartItemName } from "@utils/generate-cart-item-name";
import Image from "next/image";
import Link from "@components/ui/link";
import { number_format } from "src/helpers/my-helper";

export const CheckoutItem: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <div className="flex py-4 items-center lg:px-3 border-b border-gray-300">
      <div className="relative flex shrink-0 border rounded-md border-gray-300 w-16 h-16">
        <Image
          src={`${item.image}` || "/assets/placeholder/order-product.svg"}
          width={64}
          height={64}
          alt="currency"
          className="object-cover"
        />
      </div>
      <Link
        href={"/products/" + item.slug}
        className="text-sm ltr:pl-3 rtl:pr-3 font-regular text-heading"
      >
        {generateCartItemName(item.name, item.attributes)}
        <span className="block">SKU: {item.sku}</span>
        <span className="block">
          Qty:{" "}
          <span className="bg-green-300 px-2 rounded-sm font-semibold">
            {item.quantity}
          </span>
        </span>
      </Link>
      <div className="flex ltr:ml-auto rtl:mr-auto text-heading text-sm ltr:pl-2 rtl:pr-2 flex-shrink-0">
        {number_format(item.price)}
      </div>
    </div>
  );
};
