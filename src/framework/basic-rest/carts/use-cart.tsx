import { Item } from "@contexts/cart/cart.utils";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

async function addToCart(item: any, quantity: number) {
    const { data } = await http.post(`${API_ENDPOINTS.ADD_TO_CART}`, {
        ...item,
        quantity
    })
    return data
}

export const useCartMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: ({ item, quantity }: { item: Item; quantity: number }) => addToCart(item, quantity),
            onMutate: async ({ item, quantity }) => {
                const previousCart = queryClient.getQueryData([API_ENDPOINTS.CARTS]);
                queryClient.setQueryData([API_ENDPOINTS.CARTS], (old: any) => {
                    if (!old) return old;
                    const updatedItems = [...old.items];
                    const itemIndex = updatedItems.findIndex((cartItem: any) => cartItem.id === item.id);
                    if (itemIndex >= 0) {
                        updatedItems[itemIndex].quantity += quantity; // Cập nhật số lượng sản phẩm
                    } else {
                        updatedItems.push({ ...item, quantity }); // Thêm mới sản phẩm vào giỏ
                    }
                    const totalItems = updatedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
                    const total = updatedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
                    return {
                        ...old,
                        items: updatedItems,
                        totalItems,
                        total,
                    };
                });
                return { previousCart };
            },
            onSettled: () => {
                queryClient.invalidateQueries({
                    queryKey: [API_ENDPOINTS.CARTS]
                })
            },
            onSuccess: (data) => {
                toast(data.message, {
                    progressClassName: "fancy-progress-bar",
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            },
            onError: (data) => {
                console.log(data, "Checkout error response");
            },
        }
    );
};