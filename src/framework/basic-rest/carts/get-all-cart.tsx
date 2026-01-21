import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { State } from "@contexts/cart/cart.reducer";

/** Ưu tiên promotion_price, không có thì product_price, cuối cùng price */
export const getEffectiveCartPrice = (item: Record<string, unknown>): number => {
    const raw = item.promotion_price ?? item.product_price ?? item.price;
    return (raw != null && raw !== "") ? (Number(raw) || 0) : 0;
};

export const fetchCarts = async () => {
    const { data } = await http.get(`${API_ENDPOINTS.CARTS}`);
    return data;
};

export const useCartQuery = (options = {}) => {
    return useQuery<State, Error>({
        queryKey: [API_ENDPOINTS.CARTS],
        queryFn: async () => {
            const data = await fetchCarts();
            const totalItems = data.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
            const totalUniqueItems = data.length;
            const total = data.reduce((sum: number, item: Record<string, unknown> & { quantity?: number }) => sum + getEffectiveCartPrice(item) * (item.quantity || 0), 0);
            return {
                items: data,
                isEmpty: data.length === 0,
                totalItems,
                totalUniqueItems,
                total,
            };
        },
        staleTime: 1000 * 60 * 10,
        ...options,
    });
};
