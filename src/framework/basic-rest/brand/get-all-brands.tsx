import { QueryOptionsType, Brand } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { unwrap, adaptBrand } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

export const fetchBrands = async () => {
  const { data } = await http.get(API_ENDPOINTS.BRANDS);
  const list = unwrap<any[]>(data).map(adaptBrand);
  // DSC consume 3 nhánh (block/grid/timer) từ cùng 1 list admin-vgd.
  return { brands: list, brandsGrid: list, brandsTimer: list };
};
const fetchFilteredBrands = async (options: QueryOptionsType = {}) => {
  const { slug, text, ...query } = options;
  const normalizedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const normalizedSearch = Array.isArray(text) ? text[0] : text;
  // BE (BrandController@index actions=filters → filterBuilder) scope brand theo
  // `category_slug` + `search`, KHÔNG đọc `slug`/`text`. Map + in_stock_only=1 để
  // filter panel chỉ show brand có mặt trong tập product đang list (còn hàng).
  const { data } = await http.get(API_ENDPOINTS.BRANDS_FILTERS, {
    params: {
      ...query,
      in_stock_only: 1,
      ...(normalizedSlug ? { category_slug: normalizedSlug } : {}),
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    },
  });
  const list = unwrap<any[]>(data).map(adaptBrand);
  return { brands: list, brandsGrid: list, brandsTimer: list };
};
export const useBrandsQuery = (options: QueryOptionsType) => {
  const normalizedSlug = Array.isArray(options.slug)
    ? options.slug.join("/")
    : options.slug;
  return useQuery<
    { brands: Brand[]; brandsGrid: Brand[]; brandsTimer: Brand[] },
    Error
  >({
    queryKey:
      options.actions === "filters"
        ? [API_ENDPOINTS.BRANDS_FILTERS, { ...options, slug: normalizedSlug }]
        : [API_ENDPOINTS.BRANDS, options],
    queryFn:
      options.actions === "filters"
        ? () => fetchFilteredBrands({ ...options, slug: normalizedSlug })
        : fetchBrands,
  });
};
