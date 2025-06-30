/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 90_000,
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    const { response, message } = error;

    console.error("Axios Error Intercepted:", {
      message: message,
      status: response?.status,
      data: response?.data,
      url: error.config?.url,
    });

    const serializableError = {
      message:
        (response?.data as any)?.message ||
        message ||
        "An unknown API error occurred.",
      status: response?.status,
      data: response?.data,
    };

    return Promise.reject(serializableError);
  }
);

export default instance;
