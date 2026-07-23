import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptOrderDetail, unwrap } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GC_TIME = 1000 * 60 * 15; // 15 minutes

export const fetchOrder = async (_id: string) => {
  // admin-vgd trả `{ success, data: OrderResource }` — unwrap + adapt về shape
  // OrderDetails kỳ vọng (order_items/grand_total/memo). Trước đây trả nguyên
  // envelope → `order.order_items` undefined → crash runtime ngay sau checkout.
  const { data } = await http.get(`${API_ENDPOINTS.ORDER}/${_id}`);
  return adaptOrderDetail(unwrap(data));
};

export type OrderDetail = ReturnType<typeof adaptOrderDetail>;

export const useOrderQuery = (id?: string) => {
  return useQuery<OrderDetail, Error>({
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
