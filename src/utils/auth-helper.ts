import { me } from "@framework/auth/use-login";
import Cookies from "js-cookie";

export const handleLoginSuccess = async (
  data: any,
  authLogin: Function,
  authorize: Function
) => {
  const loginData = data.data;
  const { context } = loginData;
  
  if (context && context !== 'client') {
    throw new Error(`Invalid token context: ${context}. Expected: client`);
  }
  
  // ✅ FIX: Lưu access_token vào cookie để có thể đọc được bằng JavaScript
  // Backend đã set httpOnly cookie, nhưng cần token trong cookie có thể đọc được để set Authorization header
  if (loginData.access_token) {
    Cookies.set("client_access_token", loginData.access_token, {
      expires: loginData.remember ? 7 : 1, // 7 ngày nếu remember, 1 ngày nếu không
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    });
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
