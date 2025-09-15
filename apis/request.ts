import { StorageKey } from '@/constants';
import axios, { AxiosError } from 'axios';

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 120_000,
});

instance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem(StorageKey.AUTH_TOKEN);
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    const { response, message } = error;

    console.error('Axios Error Intercepted:', {
      message: message,
      status: response?.status,
      data: response?.data,
      url: error.config?.url,
    });

    // 处理认证失败
    if (response?.status === 401) {
      // 清除本地存储的 token
      localStorage.removeItem(StorageKey.AUTH_TOKEN);

      // 清除 cookie
      if (typeof document !== 'undefined') {
        document.cookie = `${StorageKey.AUTH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      // 如果不是已经在登录页面，则重定向到登录页
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const serializableError = {
      message: (response?.data as any)?.message || message || 'An unknown API error occurred.',
      status: response?.status,
      data: response?.data,
    };

    return Promise.reject(serializableError);
  },
);

export default instance;
