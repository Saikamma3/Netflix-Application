import { api } from "./client";
import { Content, WatchProgress } from "../types";

export const userApi = {
  getWatchlist:   () => api.get<{ success: boolean; data: Content[] }>("/watchlist"),
  addToWatchlist: (contentId: string) => api.post("/watchlist", { contentId }),
  removeFromWatchlist: (contentId: string) => api.delete(`/watchlist/${contentId}`),

  getContinueWatching: () => api.get<{ success: boolean; data: WatchProgress[] }>("/progress"),
  getProgress:         (contentId: string) =>
    api.get<{ success: boolean; data: WatchProgress | null }>(`/progress/${contentId}`),
  saveProgress: (contentId: string, secondsWatched: number, episodeId?: string, completed = false) =>
    api.post("/progress", { contentId, episodeId, secondsWatched, completed }),
};
