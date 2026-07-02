import SectionHeader from "@components/common/section-header";
import ProductCard from "@components/product/product-card";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { useRelatedProductsQuery } from "@framework/product/get-related-product";
import { Product } from "@framework/types";
import { useEffect, useMemo, useCallback, memo } from "react";
import { useInView } from "react-intersection-observer";

interface ProductsProps {
  sectionHeading: string;
  className?: string;
  slug: string;
}

// ✅ OPTIMIZE: Memoize component để tránh re-render không cần thiết
const RelatedProducts: React.FC<ProductsProps> = memo(
  ({ sectionHeading, className = "mb-9 lg:mb-10 xl:mb-14", slug }) => {
    // ✅ OPTIMIZE: Memoize normalizedSlug
    const normalizedSlug = useMemo(
      () => (typeof slug === "string" ? slug : ""),
      [slug],
    );
    const shouldFetch = normalizedSlug.length > 0;

    const {
      data,
      isFetching,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      error,
    } = useRelatedProductsQuery(
      { text: normalizedSlug },
      {
        enabled: shouldFetch,
      },
    );

    // ✅ OPTIMIZE: Tối ưu intersection observer với threshold và rootMargin
    const { ref, inView } = useInView({
      threshold: 0.1,
      rootMargin: "100px", // Trigger sớm hơn 100px để load mượt hơn
    });

    // ✅ OPTIMIZE: Memoize fetchNextPage handler
    const handleLoadMore = useCallback(() => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Auto load thêm khi đáy vào viewport
    useEffect(() => {
      handleLoadMore();
    }, [handleLoadMore]);

    // ✅ OPTIMIZE: Tối ưu allProducts calculation - tách logic filter
    const allProducts: Product[] = useMemo(() => {
      if (!data?.pages) return [];

      const pages: any[] = data.pages;
      // Render y hệt product list (cùng ProductCard). Stock đã lọc ở BE
      // (getRelated in-stock), KHÔNG filter lại client — tránh drop nhầm SP
      // card-mode (colorways không mang `quantity`).
      return pages.flatMap((p) => p?.products ?? p?.data ?? []) as Product[];
    }, [data]);

    // ✅ OPTIMIZE: Memoize showInitialLoader
    const showInitialLoader = useMemo(
      () => isFetching && !(data?.pages && data.pages.length > 0),
      [isFetching, data?.pages],
    );

    // ✅ OPTIMIZE: Memoize empty state check
    const isEmpty = useMemo(
      () =>
        !showInitialLoader && !isFetchingNextPage && allProducts.length === 0,
      [showInitialLoader, isFetchingNextPage, allProducts.length],
    );

    if (error)
      return (
        <p className="text-red-500">{(error as any)?.message ?? "Error"}</p>
      );

    return (
      <div className={className}>
        <SectionHeader sectionHeading={sectionHeading} />

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
          {showInitialLoader ? (
            <ProductFeedLoader limit={10} uniqueKey="related-init" />
          ) : (
            allProducts.map((product) => (
              <ProductCard
                key={`product-${product.id}`}
                product={product}
                imgWidth={340}
                imgHeight={340}
                variant="grid"
                imgLoading="lazy" // ✅ OPTIMIZE: Lazy load images
              />
            ))
          )}
        </div>

        {/* Sentinel để trigger load-more */}
        <div ref={ref} className="h-10" />

        {/* Loader khi load thêm (không che grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
          {isFetchingNextPage && (
            <ProductFeedLoader limit={5} uniqueKey="related-next" />
          )}
          {isEmpty && (
            <p className="text-sm text-gray-500">No products found.</p>
          )}
          {isFetching && !isFetchingNextPage && data?.pages?.length ? (
            <p className="text-center text-sm text-gray-400">Đang đồng bộ...</p>
          ) : null}
        </div>
      </div>
    );
  },
);

RelatedProducts.displayName = "RelatedProducts";

export default RelatedProducts;
