// import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
// import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export interface ChangePasswordInputType {
  newPassword: string;
  oldPassword: string;
  confirmPassword: string;
}
async function changePassword(input: ChangePasswordInputType) {
  return http.post(API_ENDPOINTS.CHANGE_PASSWORD, input);
}
export const useChangePasswordMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: (input: ChangePasswordInputType) => changePassword(input),
    onSuccess: (data) => {
      toast(data.data.message, {
        progressClassName: "fancy-progress-bar",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      router.push('/my-account');
    },
    onError: (data) => {
      console.log(data, "ChangePassword error response");
    },
  });
};
