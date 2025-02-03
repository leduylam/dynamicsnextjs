
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchOrders = async () => {
  const {
    data
  } = await http.get(API_ENDPOINTS.ORDERS);
  return data;
};
export const useOrdersQuery = () => {
  return useQuery<any, Error>({
    queryKey: [API_ENDPOINTS.ORDERS],
    queryFn: fetchOrders
  });
};
