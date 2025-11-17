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
