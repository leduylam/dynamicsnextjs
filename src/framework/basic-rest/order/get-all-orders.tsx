
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptOrderSummary, unwrap } from "@framework/utils/adapt";
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
  // admin-vgd trả `{ success, data: [OrderResource...] }` — unwrap + adapt về
  // shape api-dsc cũ (order_code/publish/grand_total) mà OrdersTable render.
  // Trước đây đọc thẳng `data.orders` (không tồn tại) → bảng Orders luôn rỗng
  // dù checkout đã tạo đơn thành công.
  const { data } = await http.get(API_ENDPOINTS.ORDERS);
  const list = unwrap<unknown[]>(data) ?? [];
  return { orders: (Array.isArray(list) ? list : []).map(adaptOrderSummary) };
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
