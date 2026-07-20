import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../store";
import { setTokens, logout } from "../store/auth.slice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh on 401
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = store.getState().auth.refreshToken;
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = data.data;

      store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));
      queue.forEach((cb) => cb(accessToken));
      queue = [];

      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch {
      store.dispatch(logout());
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);
