import { QueryOptionsType, Brand } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchBrands = async () => {
  const { data } = await http.get(API_ENDPOINTS.BRANDS);
  return data;
};

export const useBrandsQuery = (options: QueryOptionsType) => {
  return useQuery<
    { brands: Brand[]; brandsGrid: Brand[]; brandsTimer: Brand[] },
    Error
  >({
    queryKey: [API_ENDPOINTS.BRANDS, options],
    queryFn: fetchBrands,
    staleTime: 1000 * 60 * 10,
  });
};
