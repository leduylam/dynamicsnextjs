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
  const { slug, text, ...restOptions } = options;
  const normalizedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  // BE lọc từ khoá qua `search` (ProductController@list → applySearch trên
  // name/slug/sku), KHÔNG đọc `text`. Search box redirect `/search?text=...`
  // nên phải map `text` → `search`, nếu không BE bỏ qua → trả TẤT CẢ product.
  const normalizedSearch = Array.isArray(text) ? text[0] : text;
  const params = {
    ...restOptions,
    page: pageParam,
    locale: options.locale || "en",
    card: 1, // admin-vgd: chế độ grid card (bỏ load variant nặng)
    // Storefront chỉ hiển thị sản phẩm còn hàng — BE lọc (applyStockFilter):
    // có variant → SUM(stock variant) > 0; không variant → stock_quantity > 0.
    in_stock_only: 1,
    // BE lọc category qua `category_slug` (ProductFilterBuilder), KHÔNG đọc `slug`.
    // Trước đây gửi `slug` → BE bỏ qua → category page trả TẤT CẢ product.
    ...(normalizedSlug ? { category_slug: normalizedSlug } : {}),
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
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
