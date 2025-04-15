import Cookies from "js-cookie";
import { me } from "@framework/auth/use-login";

export const handleLoginSuccess = async (
  data: any,
  authLogin: Function,
  authorize: Function
) => {
  const { access_token, refresh_token, expires_in } = data.data;
  const expires = new Date(new Date().getTime() + expires_in * 60 * 60 * 1000);

  // 1. Set cookies
  Cookies.set("access_token", access_token, { expires });
  Cookies.set("refresh_token", refresh_token, { expires });

  // 2. Get user & set auth
  const user = await me();
  authLogin(user, access_token, refresh_token, expires_in);
  authorize(user);
};
