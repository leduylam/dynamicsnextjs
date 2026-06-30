import { QueryOptionsType, Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptProductArray } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

export const fetchBestSellerProducts = async () => {
  const { data } = await http.get(API_ENDPOINTS.BEST_SELLER_PRODUCTS, {
    params: { limit: 10 },
  });
  return adaptProductArray(data) as Product[];
};
export const useBestSellerProductsQuery = (options: QueryOptionsType) => {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.BEST_SELLER_PRODUCTS, options],
    queryFn: fetchBestSellerProducts,
    staleTime: 1000 * 60 * 10,
  });
};
