import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptProductArray } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";
import { usePriceAudienceKey } from "@contexts/auth/auth-context";

export const fetchNewArrivalProducts = async () => {
  const { data } = await http.get(API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS, {
    params: { limit: 10 },
  });
  return { products: adaptProductArray(data) };
};

export const fetchNewArrivalAncientProducts = async () => {
  const { data } = await http.get(API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT, {
    params: { limit: 10 },
  });
  return { products: adaptProductArray(data) };
};

type NewArrivalQueryOptions = QueryOptionsType & {
  demoVariant?: string;
};

export const useNewArrivalProductsQuery = (
  options: NewArrivalQueryOptions
) => {
  // Đây là nơi idiom "định danh trong queryKey" xuất hiện đầu tiên; nay dùng
  // chung helper với các query giá khác (`usePriceAudienceKey`) để repo chỉ có
  // MỘT cách diễn đạt — và không còn ném khi đứng ngoài AuthProvider.
  const audience = usePriceAudienceKey();

  return useQuery({
    queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT, options, audience],
    queryFn:
      options.demoVariant === "ancient"
        ? fetchNewArrivalAncientProducts
        : fetchNewArrivalProducts,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
