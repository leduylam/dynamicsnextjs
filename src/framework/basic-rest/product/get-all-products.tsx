import { QueryOptionsType, Product } from "@framework/types";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useInfiniteQuery } from "@tanstack/react-query";
export type PaginatedProduct = {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  [key: string]: any;
};
const fetchProducts = async ({ pageParam = 1, queryKey, token }: any) => {
  const [_url, options] = queryKey;
  const normalizedSlug = Array.isArray(options.slug)
    ? options.slug.join("/")
    : options.slug;
  const params = {
    ...options,
    slug: normalizedSlug,
    page: pageParam,
    locale: options.locale || "en",
  };
  const { data } = await http.get(API_ENDPOINTS.PRODUCTS, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
};

const useProductsQuery = (options: QueryOptionsType) => {
  const normalizedSlug = Array.isArray(options.slug)
    ? options.slug.join("/")
    : options.slug;

  const stableOptions = {
    ...options,
    slug: normalizedSlug,
  };

  return useInfiniteQuery<PaginatedProduct, Error>({
    queryKey: [API_ENDPOINTS.PRODUCTS, stableOptions],
    queryFn: fetchProducts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.current_page ?? 1;
      const totalPages = lastPage.last_page ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });
};

export { useProductsQuery, fetchProducts };
