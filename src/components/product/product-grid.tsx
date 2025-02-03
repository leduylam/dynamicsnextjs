import ProductCard from "@components/product/product-card";
import Button from "@components/ui/button";
import type { FC } from "react";
import { useProductsQuery } from "@framework/product/get-all-products";
import { useRouter } from "next/router";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { Product } from "@framework/types";
interface ProductGridProps {
  className?: string;
  params?: { [anyProp: string]: string }
}

export const ProductGrid: FC<ProductGridProps> = ({ className = "", params }) => {
  const { query } = useRouter();

  const {
    isFetching: isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    data,
    error,
  } = useProductsQuery({ limit: 20, ...query, ...params });
  if (error) return <p>{error.message}</p>;
  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 ${className}`}
      >
        {isLoading && !data?.pages?.length ? (
          <ProductFeedLoader limit={20} uniqueKey="search-product" />
        ) : (
          data?.pages?.flatMap((page) => {
            return page?.data?.map((product: Product) => (
              <ProductCard
                key={`product--key${product.id}`}
                product={product}
                variant="grid"
              />
            ));
          })
        )}
      </div>
      <div className="text-center pt-8 xl:pt-14">
        {hasNextPage && (
          <Button
            loading={loadingMore}
            disabled={loadingMore}
            onClick={() => fetchNextPage()}
            variant="slim"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Load More
          </Button>
        )}
      </div>
    </>
  );
};


