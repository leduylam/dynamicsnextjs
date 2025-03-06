import axios, { AxiosRequestConfig } from "axios";
import { getToken } from "./get-token";
import Cookies from "js-cookie";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Change request data/error here
http.interceptors.response.use(
  (config) => {
    const token = getToken();
    config.headers.Authorization = `Bearer ${token || ""}`;
    return config;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest._retry) {
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

const refreshAccessToken = async () => {
  try {
    const response = await http.post(
      `v1/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const { access_token } = response.data;
    Cookies.set("access_token", access_token);
    return access_token;
  } catch (error) {
    console.log("Unable to initialize access token");
  }
};
// http.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };
//     console.log(originalRequest);

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const newToken = await refreshAccessToken();
//         if (originalRequest.headers) {
//           originalRequest.headers.Authorization = `Bearer ${
//             newToken ? newToken : ""
//           }`;
//         } else {
//           originalRequest.headers = {
//             Authorization: `Bearer ${newToken ? newToken : ""}`,
//           };
//         }
//         return http(originalRequest);
//       } catch (error) {
//         return Promise.reject(error);
//       }
//     }
//   }
// );

export default http;
