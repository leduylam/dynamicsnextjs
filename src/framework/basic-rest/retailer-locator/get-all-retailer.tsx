
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useInfiniteQuery } from "@tanstack/react-query";

export const fetchRetailer = async ({ queryKey, pageParam = 0 }: any) => {
    const [_key, options] = queryKey;
    const { data } = await http.get(API_ENDPOINTS.RETAILER_LOCATOR, {
        params: {
            ...options, // Gửi options làm params
            page: pageParam, // Gửi thông tin trang hiện tại
        },
    });
    const nextPageLink = data.links.find((link: any) => link.label === "Next &raquo;");
    const nextPage = nextPageLink && nextPageLink.url ?
        new URL(nextPageLink.url).searchParams.get('page') : null;
    const hasNextPage = Boolean(nextPage);
    return {
        data: data.stores,
        paginatorInfo: {
            nextPageUrl: nextPage,
            hasNextPage,
        },
    };
};
export const useRetailerQuery = (options: any) => {
    return useInfiniteQuery<any, Error>({
        queryKey: [API_ENDPOINTS.RETAILER_LOCATOR, options],
        queryFn: fetchRetailer,
        initialPageParam: 0,
        getNextPageParam: ({ paginatorInfo }) => {
            return paginatorInfo.nextPageUrl ? Number(paginatorInfo.nextPageUrl) : undefined;
        },
    });
};

export const getProvinces = async () => {
    const response = await http.get(API_ENDPOINTS.PROVINCES)
    return response;
}
