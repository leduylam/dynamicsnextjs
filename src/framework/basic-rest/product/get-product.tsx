import { Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { unwrap, adaptProductDetail } from "@framework/utils/adapt";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

import { usePriceAudienceKey } from "@contexts/auth/auth-context";

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
  // MẢNH KHOÁ định danh, không phải tham số request — xem `usePriceAudienceKey`.
  // SSR luôn prefetch dưới `null` (chạy không token ⇒ dữ liệu không có giá); khi
  // phiên khôi phục xong khoá đổi sang id người dùng ⇒ fetch lại và giá hiện ra.
  const audience = usePriceAudienceKey();

  return useQuery<Product, Error>({
    queryKey: [API_ENDPOINTS.PRODUCT, { slug }, audience],
    queryFn: fetchProduct,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    gcTime: 1000 * 60 * 10, // Giữ cache 10 phút
    refetchOnWindowFocus: false,
  });
};
