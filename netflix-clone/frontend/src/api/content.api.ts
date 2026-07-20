import { api } from "./client";
import { Content, Genre, Episode } from "../types";

export const contentApi = {
  getFeatured: () =>
    api.get<{ success: boolean; data: Content[] }>("/content/featured"),
  getGenres: () =>
    api.get<{ success: boolean; data: Genre[] }>("/content/genres"),
  getByGenre: (slug: string, page = 1) =>
    api.get<{ success: boolean; data: Content[] }>(`/content/by-genre/${slug}`, { params: { page } }),
  search: (q: string) =>
    api.get<{ success: boolean; data: Content[] }>("/content/search", { params: { q } }),
  getById: (id: string) =>
    api.get<{ success: boolean; data: Content }>(`/content/${id}`),
  getEpisodes: (id: string, season?: number) =>
    api.get<{ success: boolean; data: Episode[] }>(`/content/${id}/episodes`, { params: { season } }),
};
