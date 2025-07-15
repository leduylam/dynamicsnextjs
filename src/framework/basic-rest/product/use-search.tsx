import { QueryOptionsType, Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchSearchedProducts = async (options: QueryOptionsType) => {
  if (options.text === "") {
    return null;
  }
  const queryParams = new URLSearchParams(
    options as Record<string, string>
  ).toString();
  const resource = await http.get(`${API_ENDPOINTS.SEARCH}?${queryParams}`);
  return resource.data.data;
};
export const useSearchQuery = (options: QueryOptionsType) => {
  const text = options.text || "";
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.SEARCH, options],
    queryFn: () => fetchSearchedProducts(options),
    enabled: text.length > 0,
    staleTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
  });
};
