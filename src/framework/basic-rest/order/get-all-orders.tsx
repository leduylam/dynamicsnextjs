
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GC_TIME = 1000 * 60 * 15; // 15 minutes

export type OrderSummary = {
  id: number | string;
  order_code: string;
  created_at: string;
  publish: {
    name: string;
    className?: string;
  };
  memo?: string;
  grand_total: number;
};

export type OrdersResponse = {
  orders: OrderSummary[];
  [key: string]: unknown;
};

export const fetchOrders = async (): Promise<OrdersResponse> => {
  const { data } = await http.get(API_ENDPOINTS.ORDERS);
  return data as OrdersResponse;
};

export const useOrdersQuery = () => {
  return useQuery<OrdersResponse, Error>({
    queryKey: [API_ENDPOINTS.ORDERS],
    queryFn: fetchOrders,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};
