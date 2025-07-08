import { QueryOptionsType, Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

export const fetchRelatedProducts = async ({
  queryKey,
}: QueryFunctionContext): Promise<Product[]> => {
  const [_key, options] = queryKey as [string, QueryOptionsType];
  if (!options?.text) return [];
  const { data } = await http.get(API_ENDPOINTS.RELATED_PRODUCTS, {
    params: options, // đúng chuẩn rồi nè
  });
  return data;
};
export const useRelatedProductsQuery = (options: QueryOptionsType) => {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, options],
    queryFn: fetchRelatedProducts,
  });
};
