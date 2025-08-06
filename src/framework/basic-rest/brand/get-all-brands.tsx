import { QueryOptionsType, Brand } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchBrands = async () => {
  const { data } = await http.get(API_ENDPOINTS.BRANDS);
  return data;
};
const fetchFilteredBrands = async (options: QueryOptionsType = {}) => {
  const { slug, ...query } = options;
  const normalizedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const { data } = await http.get(API_ENDPOINTS.BRANDS_FILTERS, {
    params: { ...query, slug: normalizedSlug },
  });
  return data;
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
