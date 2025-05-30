/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15_000,
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    if (error.response) {
      console.error("Response Error Data:", error.response.data);
      console.error("Response Error Status:", error.response.status);
      return Promise.reject(
        error.response.data || {
          code: error.response.status,
          message: error.message || "服务器响应错误",
          data: null,
        }
      );
    }
    if (error.request) {
      console.error("Request Error (No Response):", error.request);
      return Promise.reject({
        code: -1,
        message: "网络错误，请检查您的连接",
        data: null,
      });
    }

    console.error("Axios Setup Error:", error.message);
    return Promise.reject({
      code: -2,
      message: error.message || "请求配置错误",
      data: null,
    });
  }
);

export default instance;
