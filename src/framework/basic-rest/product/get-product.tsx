import { Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { unwrap, adaptProductDetail } from "@framework/utils/adapt";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

export const fetchProduct = async ({
  queryKey,
  token,
}: QueryFunctionContext & { token?: string | null }): Promise<Product> => {
  const [_key, { slug }] = queryKey as [string, { slug: string }];
  const { data } = await http.get(
    `${API_ENDPOINTS.PRODUCT}/${encodeURIComponent(slug)}`,
    {
      params: { locale: "en" },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return adaptProductDetail(unwrap(data)) as Product;
};

// ✅ OPTIMIZE: Thêm staleTime và gcTime để cache tốt hơn
export const useProductQuery = (slug: string) => {
  return useQuery<Product, Error>({
    queryKey: [API_ENDPOINTS.PRODUCT, { slug }],
    queryFn: fetchProduct,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    gcTime: 1000 * 60 * 10, // Giữ cache 10 phút
    refetchOnWindowFocus: false,
  });
};
