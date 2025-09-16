import { useMutation } from "@tanstack/react-query";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useUI } from "@contexts/ui.context";
import { toast } from "react-toastify";

export interface ForgetPasswordType {
  email: string;
}
async function forgetPassword(input: ForgetPasswordType) {
  const { data } = await http.post(API_ENDPOINTS.FORGET_PASSWORD, input);
  return data;
}
export const useForgetPasswordMutation = () => {
  const { closeModal } = useUI();
  return useMutation({
    mutationFn: (input: ForgetPasswordType) => forgetPassword(input),
    onSuccess: (data) => {
      closeModal();
      toast.success(data.message);
    },
    onError: (error: any) => {
      console.log(error, "forget password error response");
    },
  });
};
