import { useUI } from '@contexts/ui.context';
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useAuth } from '@contexts/auth/auth-context';
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
  return useMutation({
    mutationFn: (input: LoginInputType) => login(input),
    onSuccess: async (data) => {
      const { access_token, refresh_token, expires_in } = data.data;
      const expires = new Date(new Date().getTime() + expires_in * 60 * 60 * 1000);
      Cookies.set('access_token', access_token, { expires });
      Cookies.set('refresh_token', refresh_token, { expires });
      try {
        const user = await me()
        authLogin(user, access_token, refresh_token, expires_in);
        authorize(user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
      closeModal();
    },
    onError: (data: any) => {
      if (data instanceof AxiosError) {
        if (data?.response!.status === 401) {
          toast.error(data.response!.data.error, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        }
      }
    },
  });
};
