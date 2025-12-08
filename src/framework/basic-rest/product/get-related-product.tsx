import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PaginatedProduct } from "./get-all-products";

export const fetchRelatedProducts = async ({
  pageParam = 1,
  queryKey,
  token,
}: any & { token?: string | null }) => {
  const [_key, options] = queryKey as [string, QueryOptionsType];
  if (!options?.text) return [];
  const { data } = await http.get(API_ENDPOINTS.RELATED_PRODUCTS, {
    params: {
      ...options,
      page: pageParam,
    },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
};
type RelatedProductsQueryConfig = {
  enabled?: boolean;
};

// ✅ OPTIMIZE: Thêm staleTime và gcTime để cache tốt hơn
export const useRelatedProductsQuery = (
  options: QueryOptionsType,
  queryConfig?: RelatedProductsQueryConfig
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
