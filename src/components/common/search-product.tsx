import Link from "@components/ui/link";
import Image from "next/image";
import { ROUTES } from "@utils/routes";
import { useEffect, useState } from "react";

type SearchProductProps = {
  item: any;
};

const SearchProduct: React.FC<SearchProductProps> = ({ item }) => {
  const [hoverImage, setHoverImage] = useState<string>("");
  const imagePath = process.env.NEXT_PUBLIC_SITE_URL;
  useEffect(() => {
    if (item?.image) {
      const imageUrl = `${imagePath}/${item.image.small}`;
      setHoverImage(imageUrl);
    }
  }, [item?.image]);
  return (
    <Link
      href={`${ROUTES.PRODUCT}/${item?.slug}`}
      className="flex items-center justify-start w-full h-auto group"
    >
      <div className="relative flex flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-200 rounded-md cursor-pointer ltr:mr-4 rtl:ml-4">
        <Image
          src={hoverImage}
          width={96}
          height={96}
          loading="eager"
          alt={item.name || "Product Image"}
          className="object-cover bg-gray-200"
        />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <h3 className="mb-2 text-sm truncate text-heading">{item.name}</h3>
        <div className="text-sm font-semibold text-heading">{item.sku}</div>
      </div>
    </Link>
  );
};

export default SearchProduct;
