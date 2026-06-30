import { QueryOptionsType, Product } from "@framework/types";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { adaptProductList } from "@framework/utils/adapt";
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
  const { slug, ...restOptions } = options;
  const normalizedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const params = {
    ...restOptions,
    page: pageParam,
    locale: options.locale || "en",
    card: 1, // admin-vgd: chế độ grid card (bỏ load variant nặng)
    // BE lọc category qua `category_slug` (ProductFilterBuilder), KHÔNG đọc `slug`.
    // Trước đây gửi `slug` → BE bỏ qua → category page trả TẤT CẢ product.
    ...(normalizedSlug ? { category_slug: normalizedSlug } : {}),
  };
  const { data } = await http.get(API_ENDPOINTS.PRODUCTS, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return adaptProductList(data);
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
