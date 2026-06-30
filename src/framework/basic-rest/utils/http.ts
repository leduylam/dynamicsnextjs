import axios, { AxiosRequestConfig } from "axios";
import {
  getToken,
  getRefreshToken,
  setAccessToken,
  clearAuthCookies,
} from "./get-token";
import { API_ENDPOINTS } from "./api-endpoints";
import { getSiteSlug, SITE_HEADER } from "./site";
import { adaptRefresh } from "./adapt";

/**
 * REST API base URL (Laravel backend admin-vgd).
 * Set NEXT_PUBLIC_REST_API_ENDPOINT đúng host (vd http://localhost:80 hoặc
 * https://admin.vgd.vn). Strip trailing slash để tránh `//` khi nối path.
 */
export function getBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "http://localhost";
  return url.replace(/\/+$/, "");
}

const http = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
  if (value === true) {
    isRefreshing = false;
    refreshSubscribers = [];
  }
};

http.interceptors.request.use(
  (config) => {
    // Site (tenant) scoping — gắn header X-Site-Id cho mọi call public API,
    // giống client-vgd. Single source: getSiteSlug() (env NEXT_PUBLIC_SITE_SLUG).
    // Không override khi caller đã set header tường minh.
    const siteSlug = getSiteSlug();
    if (siteSlug && !config.headers[SITE_HEADER]) {
      config.headers[SITE_HEADER] = siteSlug;
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const isRefreshEndpoint = originalRequest.url?.includes(
      API_ENDPOINTS.REFRESH_TOKEN,
    );
    const isLogoutEndpoint = originalRequest.url?.includes(
      API_ENDPOINTS.LOGOUT,
    );
    const isMeEndpoint = originalRequest.url?.includes(API_ENDPOINTS.ME);
    const status = error.response?.status;

    if (isLoggingOut) {
      return Promise.reject(new Error("User is logging out"));
    }

    if (isMeEndpoint && (status === 401 || status === 419)) {
      return Promise.reject(error);
    }

    if (
      (status === 401 || status === 419) &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isLogoutEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${
            newToken ? newToken : ""
          }`;
        } else {
          originalRequest.headers = {
            Authorization: `Bearer ${newToken ? newToken : ""}`,
          };
        }
        return http(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async () => {
  if (isLoggingOut) {
    throw new Error("User is logging out - refresh cancelled");
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthCookies();
    if (typeof window !== "undefined" && !isLoggingOut) {
      window.location.href = "/signin";
    }
    throw new Error("No refresh token available");
  }

  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      subscribeTokenRefresh((token: string) => {
        if (token) {
          resolve(token);
        } else {
          reject(new Error("Refresh failed"));
        }
      });
    });
  }

  isRefreshing = true;

  try {
    const siteSlug = getSiteSlug();
    const refreshClient = axios.create({
      baseURL: getBaseURL(),
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(siteSlug ? { [SITE_HEADER]: siteSlug } : {}),
      },
    });

    const response = await refreshClient.post(API_ENDPOINTS.REFRESH_TOKEN, {});
    const { access_token, remember } = adaptRefresh(response.data);

    if (isLoggingOut) {
      isRefreshing = false;
      refreshSubscribers = [];
      throw new Error("User logged out during refresh");
    }

    // Lưu token với cùng cấu hình như login (helper chung)
    setAccessToken(access_token, remember);
    isRefreshing = false;
    onRefreshed(access_token);

    return access_token;
  } catch (error) {
    isRefreshing = false;
    refreshSubscribers = [];

    if (!isLoggingOut) {
      clearAuthCookies();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }

    throw error;
  }
};

export default http;
