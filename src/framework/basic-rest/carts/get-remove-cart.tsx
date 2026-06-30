import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CartResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

/**
 * Cập nhật số lượng 1 cart item (admin-vgd PATCH /cart/items/{id}).
 * `quantity` = số lượng MỚI (absolute), không phải delta.
 */
export const updateCartItemQuantity = async (
  id: number | string,
  quantity: number,
): Promise<CartResponse> => {
  const { data } = await http.patch<CartResponse>(
    API_ENDPOINTS.CART_UPDATE_ITEM(id),
    { quantity },
  );
  return data;
};

export const useRemoveItemFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number | string; quantity: number }) =>
      updateCartItemQuantity(id, quantity),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CARTS] });
    },
    onError: (error) => {
      console.log(error, "Update cart item error response");
    },
  });
};
