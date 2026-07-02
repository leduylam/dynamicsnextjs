import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptProductArray } from "@framework/utils/adapt";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PaginatedProduct } from "./get-all-products";

export const fetchRelatedProducts = async ({
  queryKey,
  token,
}: any & { token?: string | null }) => {
  const [_key, options] = queryKey as [string, QueryOptionsType];
  // options.text = product slug (xem related-products.tsx).
  const slug = options?.text;
  if (!slug) {
    return {
      data: [],
      products: [],
      current_page: 1,
      last_page: 1,
      per_page: 0,
      total: 0,
    };
  }
  const { data } = await http.get(
    `${API_ENDPOINTS.RELATED_PRODUCTS}/${encodeURIComponent(String(slug))}/related`,
    {
      // card:1 để related trả shape giống product list (cùng render ProductCard).
      params: { limit: 10, locale: "en", card: 1 },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  const items = adaptProductArray(data);
  // admin-vgd related trả mảng phẳng (không phân trang) → gói 1 page.
  return {
    data: items,
    products: items,
    current_page: 1,
    last_page: 1,
    per_page: items.length,
    total: items.length,
  };
};
type RelatedProductsQueryConfig = {
  enabled?: boolean;
};

// ✅ OPTIMIZE: Thêm staleTime và gcTime để cache tốt hơn
export const useRelatedProductsQuery = (
  options: QueryOptionsType,
  queryConfig?: RelatedProductsQueryConfig,
) => {
  return useInfiniteQuery<PaginatedProduct, Error>({
    queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, options],
    queryFn: fetchRelatedProducts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.current_page ?? 1;
      const totalPages = lastPage.last_page ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: queryConfig?.enabled,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    gcTime: 1000 * 60 * 10, // Giữ cache 10 phút
    refetchOnWindowFocus: false,
  });
};
