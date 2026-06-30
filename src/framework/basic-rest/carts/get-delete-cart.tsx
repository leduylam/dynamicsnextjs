import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CartResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

/** Xoá hẳn 1 cart item (admin-vgd DELETE /cart/items/{id}). */
export const clearItemFromCart = async (
  id: string | number,
): Promise<CartResponse> => {
  const { data } = await http.delete<CartResponse>(
    API_ENDPOINTS.CART_REMOVE_ITEM(id),
  );
  return data;
};

export const useClearItemFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => clearItemFromCart(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CARTS] });
    },
    onError: (error) => {
      console.log(error, "Remove cart item error response");
    },
  });
};
