// import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
// import http from "@framework/utils/http";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useState } from "react";

export interface ForgetPasswordType {
  email: string;
}
async function forgetPassword(input: ForgetPasswordType) {
  const { data } = await http.post(API_ENDPOINTS.FORGET_PASSWORD, input);
  return data;
}
export const useForgetPasswordMutation = () => {
  const [_, setError] = useState<string | null>('')
  return useMutation({
    mutationFn: (input: ForgetPasswordType) => forgetPassword(input),
    onSuccess: (data) => {
      if (data.code === 'ERROR') {
        setError(data.message)
      }
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    },
    onError: (data) => {
      console.log(data, "forget password error response");
    },
  });
};
