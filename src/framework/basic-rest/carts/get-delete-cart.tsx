import { API_ENDPOINTS } from "@framework/utils/api-endpoints"
import http from "@framework/utils/http"

export const clearItemFromCart = async (id: string | number): Promise<any> => {
    return await http.delete(`${API_ENDPOINTS.CARTS}/${id}`, {
        method: 'DELETE'
    })
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useClearItemFromCart = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: (id: any) => clearItemFromCart(id),
            onSuccess: (data) => {
                toast(data.message, {
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