import { QueryBannerType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { unwrap, adaptBanner } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

export const fetchBanners = async () => {
  const { data } = await http.get(API_ENDPOINTS.BANNERS, {
    params: { position: "hero" },
  });
  const list = unwrap<any[]>(data).map(adaptBanner);
  return { item: list, banners: list };
};

export const getSecondBanner = async () => {
  const { data } = await http.get(API_ENDPOINTS.SECOND_BANNER, {
    params: { position: "secondary" },
  });
  const list = unwrap<any[]>(data).map(adaptBanner);
  return { item: list, banners: list };
};

export const useBannersQuery = (options: QueryBannerType) => {
  // Để react-query infer type từ fetchBanners (shape { item, banners }).
  return useQuery({
    queryKey: [API_ENDPOINTS.BANNERS, options],
    queryFn: fetchBanners,
    staleTime: 1000 * 60 * 10,
  });
};
