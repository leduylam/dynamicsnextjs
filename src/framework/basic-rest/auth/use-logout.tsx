import { useUI } from "@contexts/ui.context";
// import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
// import http from "@framework/utils/http";
import Cookies from "js-cookie";
import Router from "next/router";
import { useMutation } from "@tanstack/react-query";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export interface LoginInputType {
  email: string;
  password: string;
  remember_me: boolean;
}
async function logout() {
  return http.post(API_ENDPOINTS.LOGOUT);
  return {
    ok: true,
    message: "Logout Successful!",
  };
}
export const useLogoutMutation = () => {
  const { unauthorize } = useUI();
  return useMutation({
    mutationFn: logout,
    onSuccess: (_data) => {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      unauthorize();
      Router.push("/");
    },
    onError: (data) => {
      console.log(data, "logout error response");
    },
  });
};
