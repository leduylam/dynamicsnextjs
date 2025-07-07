import { QueryBannerType, Banner } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchBanners = async () => {
    const { data } = await http.get(API_ENDPOINTS.BANNERS);
    return data;
};

export const getSecondBanner = async () => {
    const response = await http.get(API_ENDPOINTS.SECOND_BANNER);
    return response.data;
};

export const useBannersQuery = (options: QueryBannerType) => {
    return useQuery<
        {
            [x: string]: any; banners: Banner[]; bannersGrid: Banner[]; bannersTimer: Banner[]
        },
        Error
    >({
        queryKey: [API_ENDPOINTS.BANNERS, options],
        queryFn: fetchBanners,
        staleTime: 1000 * 60 * 10,
    });
};
