import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PaginatedProduct } from "./get-all-products";

export const fetchRelatedProducts = async ({
  pageParam = 1,
  queryKey,
}: any) => {
  const [_key, options] = queryKey as [string, QueryOptionsType];
  if (!options?.text) return [];
  const { data } = await http.get(API_ENDPOINTS.RELATED_PRODUCTS, {
    params: {
      ...options,
      page: pageParam,
    },
  });
  return data;
};
export const useRelatedProductsQuery = (options: QueryOptionsType) => {
  return useInfiniteQuery<PaginatedProduct>({
    queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, options],
    queryFn: fetchRelatedProducts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.current_page ?? 1;
      const totalPages = lastPage.last_page ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};
