import { QueryOptionsType, Product } from "@framework/types";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useInfiniteQuery } from "@tanstack/react-query";
type PaginatedProduct = {
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
  return useInfiniteQuery<PaginatedProduct, Error>({
    queryKey: [API_ENDPOINTS.PRODUCTS, options],
    queryFn: fetchProducts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
  });
};

export { useProductsQuery, fetchProducts };
