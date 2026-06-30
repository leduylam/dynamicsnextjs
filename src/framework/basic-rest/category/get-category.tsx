import { QueryOptionsType, Category } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { unwrap, adaptCategory } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

export const fetchCategory = async () => {
  const { data } = await http.get(API_ENDPOINTS.CATEGORIES, {
    params: { include_all: true },
  });
  return { category: { data: unwrap<any[]>(data).map(adaptCategory) } };
};
export const useCategoriesQuery = (options: QueryOptionsType) => {
  return useQuery<{ category: { data: Category[] } }, Error>({
    queryKey: [API_ENDPOINTS.CATEGORIES, options],
    queryFn: fetchCategory,
    staleTime: 1000 * 60 * 10,
  });
};
