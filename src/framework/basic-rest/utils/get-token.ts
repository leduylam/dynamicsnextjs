import Cookies from "js-cookie";

export const getToken = () => {
  if (typeof window === undefined) {
    return null;
  }
  return Cookies.get("access_token");
};
export const getRefreshToken = () => {
  if (typeof window === undefined) {
    return null;
  }
  return Cookies.get("refresh_token");
};
