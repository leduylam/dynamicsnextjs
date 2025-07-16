import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchSizes = async (options: QueryOptionsType = {}) => {
  const { slug, ...query } = options;
  const normalizedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const { data } = await http.get(API_ENDPOINTS.SIZES, {
    params: {
      ...(normalizedSlug ? { slug: normalizedSlug } : {}),
      ...query, // brand, category, q,...
    },
  });
  return data;
};

export const useSizeQuery = (options: QueryOptionsType = {}) => {
  const normalizedSlug = Array.isArray(options.slug)
    ? options.slug.join("/")
    : options.slug;

  return useQuery({
    queryKey: [API_ENDPOINTS.SIZES, { ...options, slug: normalizedSlug }],
    queryFn: () =>
      fetchSizes({
        ...options,
        slug: normalizedSlug,
      }),
    staleTime: 1000 * 60 * 10,
  });
};
