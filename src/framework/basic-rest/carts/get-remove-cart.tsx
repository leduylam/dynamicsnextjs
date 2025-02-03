import { API_ENDPOINTS } from "@framework/utils/api-endpoints"
import http from "@framework/utils/http"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const removeFromCart = async (id: string, quantity: number): Promise<any> => {
    return await http.patch(`${API_ENDPOINTS.CARTS}/${id}`, {
        method: 'PATCH',
        quantity
    })
}
export const useRemoveItemFromCart = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: ({ id, quantity }: { id: string; quantity: number }) => removeFromCart(id, quantity),
            onMutate: async ({ id, quantity }) => {
                const previousCart = queryClient.getQueryData([API_ENDPOINTS.CARTS]);
                queryClient.setQueryData([API_ENDPOINTS.CARTS], (old: any) => {
                    if (!old) return old;
                    const updatedItems = old.items.map((item: any) => {
                        if (item.id === id) {
                            if (item.quantity <= quantity) {
                                return null;
                            } else {
                                return { ...item, quantity: item.quantity - quantity };
                            }
                        }
                        return item;
                    }).filter((item: any) => item !== null);
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
            onSuccess: (data) => {
                toast(data.data?.message, {
                    progressClassName: "fancy-progress-bar",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                queryClient.invalidateQueries({
                    queryKey: [API_ENDPOINTS.CARTS]
                })
            },
            onError: (data) => {
                console.log(data, "Checkout error response");
            },
        }
    );
};