import { QueryOptionsType, Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchNewArrivalProducts = async () => {
  const { data } = await http.get(API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS);
  return data;
};

export const fetchNewArrivalAncientProducts = async () => {
  const { data } = await http.get(API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT);
  return data;
};

export const useNewArrivalProductsQuery = (options: QueryOptionsType) => {
  return useQuery<Product[], Error>({
    queryKey:
      [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT, options],
    queryFn:
      options.demoVariant === "ancient"
        ? fetchNewArrivalAncientProducts
        : fetchNewArrivalProducts,
    staleTime: 1000 * 60 * 10,
  });
};
