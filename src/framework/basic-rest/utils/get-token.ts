import Cookies from "js-cookie";

const ACCESS_COOKIE_KEY = "client_access_token";
const REFRESH_COOKIE_KEY = "client_refresh_token";

export const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return Cookies.get(ACCESS_COOKIE_KEY);
};
export const getRefreshToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return Cookies.get(REFRESH_COOKIE_KEY);
};

/**
 * Cấu hình cookie token CHUNG cho mọi luồng auth (login / refresh / reset-password)
 * để tránh drift bảo mật giữa các nơi. `secure` ở production, `sameSite=Lax`.
 *
 * Lưu ý: đây là cookie readable (không httpOnly) để interceptor đọc gắn
 * `Authorization: Bearer`. httpOnly thật sự cần backend set — xem ghi chú auth-helper.
 */
const accessCookieOptions = (remember?: boolean): Cookies.CookieAttributes => ({
  expires: remember ? 7 : 1, // 7 ngày nếu remember, 1 ngày nếu không
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
});

export const setAccessToken = (token: string, remember?: boolean) => {
  Cookies.set(ACCESS_COOKIE_KEY, token, accessCookieOptions(remember));
};

export const setRefreshToken = (token: string) => {
  // Cookie session (hết khi đóng trình duyệt) nhưng có secure/sameSite — app đọc
  // readable cookie này làm "có phiên?" guard cho luồng refresh (xem http.ts).
  Cookies.set(REFRESH_COOKIE_KEY, token, {
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const clearAuthCookies = () => {
  Cookies.remove(ACCESS_COOKIE_KEY);
  Cookies.remove(REFRESH_COOKIE_KEY);
};
