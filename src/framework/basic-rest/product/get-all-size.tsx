import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptAttributes } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

export const fetchSizes = async (options: QueryOptionsType = {}) => {
  const { slug, text, ...query } = options;
  const normalizedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const normalizedSearch = Array.isArray(text) ? text[0] : text;
  // BE (ProductController@getAttributes → filterBuilder) scope attributes theo
  // `category_slug` + `search`, KHÔNG đọc `slug`/`text`. Không map → filter panel
  // trả TẤT CẢ attributes toàn site thay vì attributes của tập product đang list.
  const { data } = await http.get(API_ENDPOINTS.SIZES, {
    params: {
      ...query,
      ...(normalizedSlug ? { category_slug: normalizedSlug } : {}),
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    },
  });
  // Mảng phẳng [{id,name,value,label}] để getVariations() groupBy "name".
  return adaptAttributes(data);
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
