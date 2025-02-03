
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchDeliveryAddress = async () => {
    const { data } = await http.get(`${API_ENDPOINTS.DELIVERY_ADDRESS}`);
    return data;
};
export const useDeliveryAddressQuery = () => {
    return useQuery<any, Error>({
        queryKey: [API_ENDPOINTS.DELIVERY_ADDRESS],
        queryFn: () => fetchDeliveryAddress()
    });
};
export const deleteAddress = async (id: number) => {
    return await http.delete(`${API_ENDPOINTS.DELIVERY_ADDRESS}/${id}`)
}
