import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { State } from "@contexts/cart/cart.reducer";

export const fetchCarts = async () => {
    const { data } = await http.get(`${API_ENDPOINTS.CARTS}`);
    return data
};

export const useCartQuery = (options = {}) => {
    return useQuery<State, Error>({
        queryKey: [API_ENDPOINTS.CARTS],
        queryFn: async () => {
            const data = await fetchCarts()
            const totalItems = data.reduce((sum: any, item: { quantity: any; }) => sum + item.quantity, 0);
            const totalUniqueItems = data.length;
            const total = data.reduce((sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity, 0);
            return {
                items: data,
                isEmpty: data.length === 0,
                totalItems,
                totalUniqueItems,
                total,
            }
        },
        staleTime: 1000 * 60 * 10,
        ...options,
    });
};
