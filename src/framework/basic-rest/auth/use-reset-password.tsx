import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useUI } from "@contexts/ui.context";
import { useAuth } from "@contexts/auth/auth-context";
import { handleLoginSuccess } from "@utils/auth-helper";

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
      await handleLoginSuccess(_data, authLogin, authorize);
      router.push("/");
      toast.success("Đặt lại mật khẩu thành công!");
    },
    onError: (data) => {
      console.log(data, "reset password error response");
    },
  });
};
