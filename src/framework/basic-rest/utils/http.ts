import axios, { AxiosRequestConfig } from "axios";
import { getToken } from "./get-token";
import Cookies from "js-cookie";
import { API_ENDPOINTS } from "./api-endpoints";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
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
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    
    const isRefreshEndpoint = originalRequest.url?.includes(API_ENDPOINTS.REFRESH_TOKEN);
    const isLogoutEndpoint = originalRequest.url?.includes(API_ENDPOINTS.LOGOUT);
    const isMeEndpoint = originalRequest.url?.includes(API_ENDPOINTS.ME);
    const status = error.response?.status;
    
    if (isLoggingOut) {
      return Promise.reject(new Error('User is logging out'));
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
  }
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
    throw new Error('User is logging out - refresh cancelled');
  }

  const refreshToken = Cookies.get('client_refresh_token');
  if (!refreshToken) {
    Cookies.remove('client_access_token');
    if (typeof window !== 'undefined' && !isLoggingOut) {
      window.location.href = '/signin';
    }
    throw new Error('No refresh token available');
  }

  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      subscribeTokenRefresh((token: string) => {
        if (token) {
          resolve(token);
        } else {
          reject(new Error('Refresh failed'));
        }
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const response = await refreshClient.post(API_ENDPOINTS.REFRESH_TOKEN, {});
    const { access_token } = response.data;
    
    if (isLoggingOut) {
      isRefreshing = false;
      refreshSubscribers = [];
      throw new Error('User logged out during refresh');
    }
    
    Cookies.set("client_access_token", access_token);
    isRefreshing = false;
    onRefreshed(access_token);
    
    return access_token;
  } catch (error) {
    isRefreshing = false;
    refreshSubscribers = [];
    
    if (!isLoggingOut) {
      Cookies.remove('client_access_token');
      Cookies.remove('client_refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }
    
    throw error;
  }
};

export default http;
