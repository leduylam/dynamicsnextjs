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

  // ⚠️ Phải lưu token TRƯỚC mọi await/API để `http` interceptor (`getToken`) đọc
  // được ngay. Từ 2026-09-03 token nằm trong BỘ NHỚ (`get-token.ts`), không còn
  // cookie readable — nên phép gán này là đồng bộ, càng chắc điều kiện trên.
  // Refresh token vẫn do BE giữ ở httpOnly cookie `vgd_refresh_token`.
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
