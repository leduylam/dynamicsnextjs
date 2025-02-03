import { CategoriesQueryOptionsType, Category } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchCategories = async () => {
  const { data } = await http.get(API_ENDPOINTS.CATEGORIES);
  return data;
};


export const useCategoriesQuery = (options: CategoriesQueryOptionsType) => {
  return useQuery<{ categories: Category[] }, Error>({
    queryKey: [API_ENDPOINTS.CATEGORIES, options],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });
};
