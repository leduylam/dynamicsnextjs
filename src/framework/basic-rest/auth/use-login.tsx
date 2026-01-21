import { useUI } from '@contexts/ui.context';
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useAuth } from '@contexts/auth/auth-context';
import { handleLoginSuccess } from '@utils/auth-helper';
export interface LoginInputType {
  email: string;
  password: string;
  remember_me: boolean;
}
async function login(input: LoginInputType) {
  return http.post(API_ENDPOINTS.LOGIN, input);
}
export async function me(): Promise<any> {
  const response = await http.get(API_ENDPOINTS.ME);
  return response.data;
}
export const useLoginMutation = () => {
  const { authorize, closeModal } = useUI();
  const { login: authLogin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInputType) => login(input),
    onSuccess: async (data) => {
      try {
        await handleLoginSuccess(data, authLogin, authorize);
        // Invalidate product/cart queries để refetch với token mới → tránh giá 0, không cần refresh trang
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRODUCT] });
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRODUCTS] });
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.RELATED_PRODUCTS] });
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS] });
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS_ANCIENT] });
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.BEST_SELLER_PRODUCTS] });
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SEARCH] });
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CARTS] });
        closeModal();
      } catch (error) {
        toast.error("Failed to fetch user data");
      }
    },
    onError: (data: any) => {
      if (data instanceof AxiosError && data?.response?.status === 401) {
        toast.error(data.response.data.error, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    },
  });
};
