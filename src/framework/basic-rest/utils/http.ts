import axios, { AxiosRequestConfig } from "axios";
import {
  getToken,
  hasSessionHint,
  setAccessToken,
  clearAuthSession,
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

/** Call auth (login/register/refresh/…) — nhận diện để đổi base sang same-origin. */
const isAuthUrl = (url: string): boolean => url.includes("/api/auth/jwt/");

/**
 * Base URL cho call auth — **same-origin trên trình duyệt** (2026-09-04).
 *
 * Phiên sống bằng refresh cookie httpOnly. Gọi thẳng `admin.vgd.vn` thì cookie đó
 * là **cookie bên thứ ba**: đo trên prod cho thấy trình duyệt chặn 3P (Safari/ITP
 * mặc định) không đính cookie vào request ⇒ refresh **401** ⇒ khách bị đá về
 * `/signin` mỗi lần tải trang. Đi qua route `/api/auth/jwt/*` của chính storefront
 * thì cookie thành first-party. Xem `src/pages/api/auth/jwt/[...path].ts`.
 *
 * Trên server (SSR) không có origin để mà relative, và cũng không có cookie khách
 * — giữ nguyên đường trực tiếp.
 */
function authBaseURL(): string {
  return typeof window === "undefined" ? getBaseURL() : "";
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
  async (config) => {
    // Site (tenant) scoping — gắn header X-Site-Id cho mọi call public API,
    // giống client-vgd. Single source: getSiteSlug() (env NEXT_PUBLIC_SITE_SLUG).
    // Không override khi caller đã set header tường minh.
    const siteSlug = getSiteSlug();
    if (siteSlug && !config.headers[SITE_HEADER]) {
      config.headers[SITE_HEADER] = siteSlug;
    }

    // Auth đi same-origin; catalog `/api/v1/*` vẫn gọi thẳng backend (Bearer
    // không phải cookie nên không dính chính sách bên thứ ba).
    if (isAuthUrl(config.url ?? "")) {
      config.baseURL = authBaseURL();
    }

    // ⚠ PHẢI refresh CHỦ ĐỘNG, không chờ 401 — đây là chỗ dễ hỏng nhất của
    // memory-only. Token nằm trong bộ nhớ nên reload trang là mất, trong khi
    // phiên vẫn sống (refresh cookie httpOnly 30 ngày). Nếu chỉ dựa vào
    // interceptor 401 thì hỏng IM LẶNG: endpoint catalog là **public**, thiếu
    // `Authorization` nó trả **200 kiểu khách vãng lai** chứ không 401 — nghĩa
    // là `retail_price: null` (đo 2026-09-03 trên site dsc: khách null ↔ đăng
    // nhập 1.200.000). Người đã đăng nhập sẽ thấy trang "không có giá" mà không
    // request nào lỗi để mà retry.
    const isRefreshCall = config.url?.includes(API_ENDPOINTS.REFRESH_TOKEN);
    if (typeof window !== "undefined" && !isRefreshCall && !getToken() && hasSessionHint()) {
      try {
        await refreshAccessToken();
      } catch {
        // Refresh hỏng ⇒ đi tiếp như khách; `refreshAccessToken` đã tự dọn phiên.
      }
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

  // Điều kiện đúng là "còn phiên hay không", hỏi bằng cờ phiên.
  //
  // Bản cũ hỏi `getRefreshToken()` — đọc cookie `client_refresh_token`, thứ
  // **chưa bao giờ được ghi** ở bản hiện tại: BE đã bỏ `refresh_token` khỏi body
  // login (đo 2026-09-03: keys = access_token, expires_in, remember_me,
  // token_type, user) và writer duy nhất phía client hết caller. Nên mọi lần
  // refresh đều rơi vào nhánh này ⇒ xoá phiên + `location.href = "/signin"`,
  // tức khách bị **đá về trang đăng nhập** ngay khi JWT hết 60 phút. Credential
  // thật của refresh là httpOnly cookie `vgd_refresh_token`, browser tự gửi nhờ
  // `withCredentials` bên dưới — client không cần cầm gì cả.
  if (!hasSessionHint()) {
    clearAuthSession();
    if (typeof window !== "undefined" && !isLoggingOut) {
      window.location.href = "/signin";
    }
    throw new Error("No session to refresh");
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
      baseURL: authBaseURL(),
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
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }

    throw error;
  }
};

export default http;
