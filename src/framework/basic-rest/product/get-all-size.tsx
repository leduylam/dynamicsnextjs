import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchSizes = async (options: QueryOptionsType) => {
  const normalizedSlug = Array.isArray(options.slug)
    ? options.slug.join("/")
    : options.slug;
  const { data } = await http.get(API_ENDPOINTS.SIZES, {
    params: {
      ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    },
  });
  return data;
};

export const useSizeQuery = (options: QueryOptionsType) => {
  const normalizedSlug = Array.isArray(options.slug)
    ? options.slug.join("/")
    : options.slug;

  return useQuery({
    queryKey: [API_ENDPOINTS.SIZES, normalizedSlug],
    queryFn: () => fetchSizes(normalizedSlug ? { slug: normalizedSlug } : {}),
    staleTime: 1000 * 60 * 10,
    enabled: !!normalizedSlug, // Only run the query if slug is defined
  });
};
