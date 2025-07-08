import { Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

export const fetchProduct = async ({
  queryKey,
}: QueryFunctionContext): Promise<Product> => {
  const [_key, { slug }] = queryKey as [string, { slug: string }];
  const { data } = await http.get(`${API_ENDPOINTS.PRODUCT}`, {
    params: { slug },
  });
  return data;
};
export const useProductQuery = (slug: string) => {
  return useQuery<Product, Error>({
    queryKey: [API_ENDPOINTS.PRODUCT, { slug }],
    queryFn: fetchProduct,
  });
};
