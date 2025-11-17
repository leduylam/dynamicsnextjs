import { Order } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GC_TIME = 1000 * 60 * 15; // 15 minutes

export const fetchOrder = async (_id: string) => {
  const { data } = await http.get(`${API_ENDPOINTS.ORDER}/${_id}`);
  return data;
};

export const useOrderQuery = (id?: string) => {
  return useQuery<Order, Error>({
    queryKey: [API_ENDPOINTS.ORDER, id],
    queryFn: () => fetchOrder(id as string),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};
