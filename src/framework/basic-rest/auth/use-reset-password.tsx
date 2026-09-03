import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useUI } from "@contexts/ui.context";
import { useAuth } from "@contexts/auth/auth-context";
import { setAccessToken } from "@framework/utils/get-token";
import { me } from "./use-login";

export interface ResetPasswordType {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}
async function resetPassword(values: ResetPasswordType) {
  const response = await http.post(API_ENDPOINTS.RESET_PASSWORD, values);
  return response.data;
}
export const useResetPasswordMutation = () => {
  const router = useRouter();
  const { authorize } = useUI();
  const { login: authLogin } = useAuth();
  return useMutation({
    mutationFn: (values: ResetPasswordType) => resetPassword(values),
    onSuccess: async (_data) => {
      // Set token qua helper chung (secure/sameSite/expires nhất quán với login),
      // thay cho Cookies.set trần thiếu thuộc tính bảo mật trước đây.
      setAccessToken(_data.access_token);
      // Nhánh `setRefreshToken(_data.refresh_token)` đã bỏ 2026-09-03: BE KHÔNG
      // trả `refresh_token` trong body nữa (đo: keys = access_token, expires_in,
      // remember_me, token_type, user) — nó đi bằng httpOnly cookie
      // `vgd_refresh_token`. Nhánh đó không bao giờ chạy, và giữ lại thì lần sau
      // đọc code sẽ tưởng refresh token nằm phía JS.
      const res = await me();
      authLogin(res);
      authorize();
      router.push("/");
      toast.success("Đặt lại mật khẩu thành công!");
    },
    onError: (data) => {
      console.log(data, "reset password error response");
    },
  });
};
