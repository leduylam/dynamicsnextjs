import SectionHeader from "@components/common/section-header";
import ProductCard from "@components/product/product-card";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { useRelatedProductsQuery } from "@framework/product/get-related-product";
import { Product } from "@framework/types";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

interface ProductsProps {
  sectionHeading: string;
  className?: string;
  slug: string;
}
interface SubAttribute {
  quantity?: number | string;
}
interface Attribute {
  quantity?: number | string;
  sub_attributes?: SubAttribute[];
}

const RelatedProducts: React.FC<ProductsProps> = ({
  sectionHeading,
  className = "mb-9 lg:mb-10 xl:mb-14",
  slug,
}) => {
  const normalizedSlug = typeof slug === "string" ? slug : "";
  const shouldFetch = normalizedSlug.length > 0;

  const {
    data,
    isFetching, // đang fetch (init hoặc next page)
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage, // chỉ khi load thêm
    error,
  } = useRelatedProductsQuery(
    { text: normalizedSlug },
    {
      enabled: shouldFetch,
    }
  );

  const { ref, inView } = useInView();

  // Auto load thêm khi đáy vào viewport
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Chuẩn hoá dữ liệu
  const allProducts: Product[] = useMemo(() => {
    const pages: any[] = data?.pages ?? [];
    const flat = pages.flatMap((p) => p?.products ?? p?.data ?? []);
    return (flat as any[]).filter((product: any) => {
      const attrs: Attribute[] = product.attributes ?? [];
      return attrs.some((attr) => {
        const qty = Number(attr?.quantity ?? 0);
        const hasSub =
          Array.isArray(attr?.sub_attributes) &&
          attr.sub_attributes.some((s) => Number(s?.quantity ?? 0) > 0);
        return qty > 0 || hasSub;
      });
    });
  }, [data]);

  const showInitialLoader =
    isFetching && !(data?.pages && data.pages.length > 0);

  if (error)
    return <p className="text-red-500">{(error as any)?.message ?? "Error"}</p>;

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
            />
          ))
        )}
      </div>

      {/* Sentinel để trigger load-more */}
      <div ref={ref} className="h-10" />

      {/* Loader khi load thêm (không che grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
        {isFetchingNextPage && (
          <ProductFeedLoader limit={5} uniqueKey="related-init" />
        )}
        {!showInitialLoader &&
          !isFetchingNextPage &&
          allProducts.length === 0 && (
            <p className="text-sm text-gray-500">No products found.</p>
          )}
        {isFetching && !isFetchingNextPage && data?.pages?.length ? (
          <p className="text-center text-sm text-gray-400">Đang đồng bộ...</p>
        ) : null}
      </div>
    </div>
  );
};

export default RelatedProducts;
