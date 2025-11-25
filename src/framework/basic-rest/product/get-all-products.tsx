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
const fetchProducts = async ({ pageParam = 1, queryKey }: any) => {
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
  const { data } = await http.get(API_ENDPOINTS.PRODUCTS, { params });
  return data; // Giả định backend trả về { data, paginatorInfo }
};

const useProductsQuery = (options: QueryOptionsType) => {
  // Normalize slug for consistent query key
  const normalizedSlug = Array.isArray(options.slug)
    ? options.slug.join("/")
    : options.slug;
  
  // Create stable query key with normalized slug
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
    // Disable cache to ensure fresh data when switching categories
    staleTime: 0,
    gcTime: 0, // cacheTime in v4
    refetchOnMount: true,
  });
};

export { useProductsQuery, fetchProducts };
