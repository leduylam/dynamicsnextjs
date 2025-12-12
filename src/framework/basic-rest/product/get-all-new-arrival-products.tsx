import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@contexts/auth/auth-context";

export const fetchNewArrivalProducts = async () => {
  const { data } = await http.get(API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS);
  return data;
};

export const fetchNewArrivalAncientProducts = async () => {
  const { data } = await http.get(API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT);
  return data;
};

type NewArrivalQueryOptions = QueryOptionsType & {
  demoVariant?: string;
};

export const useNewArrivalProductsQuery = (
  options: NewArrivalQueryOptions
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT, options, user?.id],
    queryFn:
      options.demoVariant === "ancient"
        ? fetchNewArrivalAncientProducts
        : fetchNewArrivalProducts,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
