import { useUI } from "@contexts/ui.context";
import { useAuth } from "@contexts/auth/auth-context";
import Cookies from "js-cookie";
import Router from "next/router";
import { useMutation } from "@tanstack/react-query";
import http, { setLoggingOut } from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export interface LoginInputType {
  email: string;
  password: string;
  remember_me: boolean;
}
async function logout() {
  return http.post(API_ENDPOINTS.LOGOUT);
}
export const useLogoutMutation = () => {
  const { unauthorize } = useUI();
  const { clearState } = useAuth();
  
  const clearAllState = () => {
    setLoggingOut(true);
    clearState();
    Cookies.remove("client_access_token");
    Cookies.remove("client_refresh_token");
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('client_access_token');
      localStorage.removeItem('client_refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_state');
    }
    
    unauthorize();
  };
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAllState();
      Router.push("/").then(() => {
        setLoggingOut(false);
      });
    },
    onError: () => {
      clearAllState();
      Router.push("/").then(() => {
        setLoggingOut(false);
      });
    },
  });
};
