import ProductCard from "@components/product/product-card";
import { useEffect, type FC } from "react";
import { useProductsQuery } from "@framework/product/get-all-products";
import { useRouter } from "next/router";
import { Product } from "@framework/types";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { useInView } from "react-intersection-observer";

interface ProductGridProps {
  className?: string;
  slug?: string;
}

export const ProductGrid: FC<ProductGridProps> = ({ className = "" }) => {
  const { query } = useRouter();
  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useProductsQuery({ limit: 8, ...query });
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allProducts: Product[] =
    data?.pages?.flatMap((page) => page.products.data ?? []) ?? [];

  if (error) return <p>{error.message}</p>;
  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 ${className}`}
      >
        {isFetching && !data?.pages?.length ? (
          <ProductFeedLoader limit={20} uniqueKey="search-product" />
        ) : (
          allProducts.map((product) => (
            <ProductCard
              key={`product--key${product.id}`}
              product={product}
              variant="grid"
            />
          ))
        )}
      </div>
      <div ref={ref} className="h-10" />
      <div className="text-center pt-8 xl:pt-14">
        {isFetching && (
          <p className="text-center text-sm text-gray-400">Đang tải thêm...</p>
        )}
      </div>
    </>
  );
};
