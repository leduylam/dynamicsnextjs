import React, { useEffect, useRef } from "react";
import ProductsBlock from "@containers/products-block";
import { useNewArrivalProductsQuery } from "@framework/product/get-all-new-arrival-products";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@contexts/auth/auth-context";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

interface Props {
  hideProductDescription?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  demoVariant?: "ancient";
  disableBorderRadius?: boolean;
  className?: string;
}

const NewArrivalsProductFeed = React.memo<Props>(function NewArrivalsProductFeed({
  hideProductDescription = false,
  showCategory = false,
  showRating = false,
  demoVariant,
  disableBorderRadius = false,
  className = "mb-9 md:mb-10 xl:mb-12",
}) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const prevUserRef = useRef<typeof user>(null);
  const { data, isLoading, error, refetch } = useNewArrivalProductsQuery({
    limit: 10,
    demoVariant,
  } as any);
  
  // ✅ FIX: Refetch khi user state thay đổi từ null -> có user (sau khi login)
  useEffect(() => {
    // Chỉ refetch khi user chuyển từ null -> có user (vừa login)
    if (!authLoading && user && !prevUserRef.current) {
      // User vừa login, invalidate và refetch để lấy giá mới
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS],
      });
      // Refetch ngay lập tức
      refetch();
    }
    // Cập nhật ref để track user state
    prevUserRef.current = user;
  }, [user, authLoading, queryClient, refetch]);
  
  const allProducts = data?.products ?? [];
  return (
    <ProductsBlock
      className={className}
      hideProductDescription={hideProductDescription}
      showCategory={showCategory}
      showRating={showRating}
      sectionHeading="text-new-arrivals"
      categorySlug="/search?sort_by=newest"
      products={allProducts}
      loading={isLoading}
      error={error?.message}
      uniqueKey="new-arrivals"
      demoVariant={demoVariant}
      disableBorderRadius={disableBorderRadius}
    />
  );
});

export default NewArrivalsProductFeed;
