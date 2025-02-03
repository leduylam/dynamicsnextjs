import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";   

export const fetchSizes = async (options: QueryOptionsType) => {
    const { data } = await http.get(API_ENDPOINTS.SIZES, {
        params: {
            ...options,
        },
    });
    return data;
};

export const useSizeQuery = (options: QueryOptionsType) => {
    return useQuery({
        queryKey: [API_ENDPOINTS.SIZES, options],
        queryFn: () => fetchSizes(options),
        staleTime: 1000 * 60 * 10,
    });
};
