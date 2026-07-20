import { api } from "./client";
import { TokenPair, Profile } from "../types";

export const authApi = {
  login:         (email: string, password: string) =>
    api.post<{ success: boolean; data: TokenPair }>("/auth/login", { email, password }),
  register:      (email: string, password: string) =>
    api.post<{ success: boolean; data: TokenPair }>("/auth/register", { email, password }),
  logout:        () => api.post("/auth/logout"),
  selectProfile: (profileId: string) =>
    api.post<{ success: boolean; data: TokenPair }>("/auth/select-profile", { profileId }),
  getProfiles:   () =>
    api.get<{ success: boolean; data: Profile[] }>("/profiles"),
  createProfile: (name: string, avatarUrl?: string, isKidsProfile?: boolean) =>
    api.post<{ success: boolean; data: Profile }>("/profiles", { name, avatarUrl, isKidsProfile }),
  deleteProfile: (id: string) => api.delete(`/profiles/${id}`),
};
