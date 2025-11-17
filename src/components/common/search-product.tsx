import Link from "@components/ui/link";
import Image from "next/image";
import { ROUTES } from "@utils/routes";
import React from "react";

type SearchProductProps = {
  item: any & { highlightKeyword?: string };
};

const highlight = (text: string, keyword?: string) => {
  if (!text) {
    return null;
  }
  if (!keyword) {
    return <span>{text}</span>;
  }
  const normalizedKeyword = keyword.toLowerCase();
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedKeyword})`, "ig");
  return text.split(regex).map((segment, index) => {
    if (!segment) {
      return null;
    }
    const isMatch = segment.toLowerCase() === normalizedKeyword;
    return (
      <span
        key={`${segment}-${index}`}
        className={isMatch ? "font-bold text-gray-900" : undefined}
      >
        {segment}
      </span>
    );
  });
};

const SearchProduct: React.FC<SearchProductProps> = ({ item }) => {
  const keyword = item.highlightKeyword?.trim();
  return (
    <Link
      href={`${ROUTES.PRODUCT}/${item?.slug}`}
      className="flex items-center justify-start w-full h-auto group"
    >
      <div className="relative flex flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-200 rounded-md cursor-pointer ltr:mr-4 rtl:ml-4">
        <Image
          src={item?.image || ""}
          width={96}
          height={96}
          loading="eager"
          alt={item.name || "Product Image"}
          className="object-cover bg-gray-200"
        />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <h3 className="mb-2 text-sm truncate text-heading">
          {highlight(item.name ?? "", keyword)}
        </h3>
        <div className="text-sm font-semibold text-heading">
          {highlight(item.sku ?? "", keyword)}
        </div>
      </div>
    </Link>
  );
};

export default SearchProduct;
