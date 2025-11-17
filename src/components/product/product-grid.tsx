import ProductCard from "@components/product/product-card";
import React, { useEffect, useMemo, type FC } from "react";
import { useProductsQuery } from "@framework/product/get-all-products";
import { Product, QueryOptionsType } from "@framework/types";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/router";

interface ProductGridProps {
  className?: string;
  queryOptions?: QueryOptionsType & { locale?: string };
}

export const ProductGrid: FC<ProductGridProps> = React.memo(
  ({ className = "", queryOptions }) => {
    const { query: routerQuery, locale } = useRouter();
    const normalizedOptions = useMemo<QueryOptionsType & { locale?: string }>(() => {
      const baseOptions = {
        ...(queryOptions ?? {}),
        ...routerQuery,
      } as QueryOptionsType & { locale?: string };
      const sanitizedEntries = Object.entries(baseOptions).reduce<
        Record<string, string | string[] | number>
      >((acc, [key, value]) => {
        if (value === undefined || value === null) {
          return acc;
        }
        if (Array.isArray(value)) {
          const filtered = value.filter((item) => !!item);
          if (!filtered.length) {
            return acc;
          }
          acc[key] = filtered.length === 1 ? filtered[0] : filtered;
          return acc;
        }
        if (value === "") {
          return acc;
        }
        if (key === "page" || key === "limit") {
          const parsedNumber = Number(value);
          if (!Number.isNaN(parsedNumber)) {
            acc[key] = parsedNumber;
          }
          return acc;
        }
        acc[key] = value as string | number;
        return acc;
      }, {});
      const nextOptions = {
        limit: 8,
        ...sanitizedEntries,
        locale: sanitizedEntries.locale
          ? (sanitizedEntries.locale as string)
          : locale,
      };
      return nextOptions as QueryOptionsType & { locale?: string };
    }, [locale, queryOptions, routerQuery]);

    const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
      useProductsQuery(normalizedOptions);

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
    }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);
  
  const allProducts: Product[] = useMemo(
    () => data?.pages?.flatMap((page) => page.products ?? []) ?? [],
    [data?.pages]
  );
  if (error) return <p>{error.message}</p>;
  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 ${className}`}
      >
        {isFetching && !data?.pages?.length ? (
          <ProductFeedLoader limit={8} uniqueKey="search-product" />
        ) : (
          allProducts.map((product) => (
            <ProductCard
                key={`product--key-${product.id ?? product.slug}`}
              product={product}
              variant="grid"
            />
          ))
        )}
      </div>
      <div ref={ref} className="h-10" />
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 ${className}`}
      >
        {isFetching && (
          <ProductFeedLoader limit={4} uniqueKey="search-product" />
        )}
      </div>
    </>
  );
  }
);

ProductGrid.displayName = "ProductGrid";
