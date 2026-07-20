import { apiClient } from "./client";
import { UserDto, UpdateUserDto, PaginatedResponse } from "../types";

export const userApi = {
  me: () =>
    apiClient.get<{ success: boolean; data: UserDto }>("/users/me"),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: UserDto }>(`/users/${id}`),

  list: (page = 1, pageSize = 20) =>
    apiClient.get<PaginatedResponse<UserDto>>("/users", { params: { page, pageSize } }),

  update: (id: string, dto: UpdateUserDto) =>
    apiClient.put<{ success: boolean; data: UserDto }>(`/users/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`/users/${id}`),
};
