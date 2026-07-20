import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../store";
import { setTokens, clearAuth } from "../store/auth.slice";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15_000,
});

// Attach token
api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-refresh on 401
let refreshing = false;
let queue: Array<(t: string) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const orig = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);

    if (refreshing) {
      return new Promise((res) => queue.push((t) => { orig.headers.Authorization = `Bearer ${t}`; res(api(orig)); }));
    }

    orig._retry = true;
    refreshing  = true;
    try {
      const rt = store.getState().auth.refreshToken;
      const { data } = await axios.post("/api/auth/refresh", { refreshToken: rt });
      store.dispatch(setTokens(data.data));
      queue.forEach((cb) => cb(data.data.accessToken));
      queue = [];
      orig.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(orig);
    } catch {
      store.dispatch(clearAuth());
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  }
);
