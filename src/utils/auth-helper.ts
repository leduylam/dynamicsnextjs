import { me } from "@framework/auth/use-login";
import { setAccessToken } from "@framework/utils/get-token";

export const handleLoginSuccess = async (
  data: any,
  authLogin: Function,
  authorize: Function
) => {
  const loginData = data.data;
  const { context } = loginData;

  if (context && context !== "client") {
    throw new Error(`Invalid token context: ${context}. Expected: client`);
  }

  // ⚠️ Phải set cookie TRƯỚC mọi await/API để http interceptor (getToken) đọc được ngay
  // Backend có thể set httpOnly; ta set bản readable để Authorization: Bearer dùng được
  if (loginData.access_token) {
    setAccessToken(loginData.access_token, loginData.remember);
  }

  if (loginData.user && loginData.roles) {
    authLogin(loginData);
    authorize(loginData.user);
  } else {
    const user = await me();
    authLogin(user);
    authorize(user.user || user);
  }
};
