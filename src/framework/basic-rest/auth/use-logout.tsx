import { useUI } from "@contexts/ui.context";
import { useAuth } from "@contexts/auth/auth-context";
import { clearAuthSession } from "@framework/utils/get-token";
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
    // Qua helper chung — tên cookie + việc quên token trong bộ nhớ chỉ được
    // khai MỘT chỗ (`get-token.ts`). Bốn dòng `Cookies.remove` chép tay ở đây
    // nay sẽ bỏ sót đúng thứ quan trọng nhất: access token không còn ở cookie.
    clearAuthSession();

    if (typeof window !== 'undefined') {
      // localStorage chưa bao giờ là nơi lưu token của repo này; giữ lại phần
      // dọn để xoá rác của bản cũ trên máy khách đang có.
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
