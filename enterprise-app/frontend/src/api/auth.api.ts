import { apiClient } from "./client";
import { TokenPair } from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ success: boolean; data: TokenPair }>("/auth/login", { email, password }),

  register: (email: string, password: string, firstName: string, lastName: string) =>
    apiClient.post<{ success: boolean; data: TokenPair }>("/auth/register", {
      email, password, firstName, lastName,
    }),

  logout: () =>
    apiClient.post("/auth/logout"),

  refresh: (refreshToken: string) =>
    apiClient.post<{ success: boolean; data: TokenPair }>("/auth/refresh", { refreshToken }),
};
