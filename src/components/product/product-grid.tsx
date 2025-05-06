import ProductCard from "@components/product/product-card";
import Button from "@components/ui/button";
import { Dispatch, SetStateAction, useEffect, useRef, useState, type FC } from "react";
import { useProductsQuery } from "@framework/product/get-all-products";
import { useRouter } from "next/router";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { Product } from "@framework/types";
import ErrorInformation from "@components/404/error-information";
import { ProductSkeleton } from "./product-skeleton";
import { motion } from "framer-motion";
interface ProductGridProps {
  data?: any[]; // Danh sách sản phẩm đã hiển thị
  page?: number; // Trang hiện tại
  setPage?: Dispatch<SetStateAction<number>>; // Cập nhật trang
  setProducts?: Dispatch<SetStateAction<any[]>>; // Cập nhật danh sách sản phẩm
  preloadProducts?: any[]; // Sản phẩm đã preload
  setPreloadProducts?: Dispatch<SetStateAction<any[]>>; // Reset preload sau khi merge
  preloadNextPage?: () => Promise<void>; // Hàm preload từ server
  fetchNextPage?: () => void; // Hàm merge preload vào danh sách
  hasNextPage?: boolean; // Còn trang tiếp hay không
  loadingMore?: boolean; // Đang loading page mới hay không
  isLoading?: boolean;
  className?: string;
}

interface ProductPageProps {
  products: Product[];
  hasMore: boolean;
  page: number;
}


export const ProductGrid: FC<ProductGridProps> = ({
  data,
  page,
  setPage,
  setProducts,
  preloadProducts,
  setPreloadProducts,
  preloadNextPage,
  fetchNextPage,
  hasNextPage,
  loadingMore,
  isLoading,
  className
}) => {
  const [isComming, setIsComming] = useState(false);
  const loader = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loader.current) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if ((preloadProducts ?? []).length) {
          fetchNextPage?.();
        } else if (hasNextPage) {
          preloadNextPage?.();
        }
      }
    }, {
      root: null,
      rootMargin: "300px",
      threshold: 0,
    });

    observer.observe(loader.current);

    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [preloadProducts, hasNextPage]);
  // if (error) return <p>{error.message}</p>;
  return (
    <>
      {!isComming ? (
        <>
          <div
            className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 ${className}`}
          >
            {isLoading && page === 1 ? (
              [...Array(8)].map((_, idx) => (
                <ProductSkeleton key={`skeleton${idx}`} />
              ))
            ) : (
              data?.length && data?.map((product: Product, index: number) => {
                return (
                  <motion.div
                    key={`product-motion-${product.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard
                      index={index}
                      // key={`product--key${product.id}`}
                      product={product}
                      variant="grid"
                    />
                  </motion.div>

                );
              })
            )}
          </div>
          <div ref={loader}></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
            {loadingMore && (
              [...Array(4)].map((_, idx) => (
                <ProductSkeleton key={`skeleton-load${idx}`} />
              ))
            )}
            {/* {hasNextPage && (
              <Button
                loading={loadingMore}
                disabled={loadingMore}
                onClick={() => fetchNextPage()}
                variant="slim"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Load More
              </Button>
            )} */}
          </div>
        </>

      ) : (
        <ErrorInformation
          image=""
          title="Coming soon!"
          text="This product is not available yet. Check back later!"
        />
      )}
    </>
  );
};


