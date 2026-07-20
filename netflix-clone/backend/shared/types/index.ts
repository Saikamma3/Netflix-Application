import { Request } from "express";

export interface JwtPayload {
  sub: string;        // user id
  email: string;
  profileId?: string; // active profile
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

// ── DTOs ──────────────────────────────────────────────────────────────
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type ContentType = "MOVIE" | "SHOW";

export interface GenreDto {
  id:   string;
  name: string;
  slug: string;
}

export interface EpisodeDto {
  id:            string;
  season:        number;
  episodeNumber: number;
  title:         string;
  description:   string;
  duration:      number;
  thumbnailUrl:  string | null;
}

export interface ContentDto {
  id:             string;
  title:          string;
  description:    string;
  type:           ContentType;
  releaseYear:    number;
  maturityRating: string;
  duration:       number | null;
  posterUrl:      string;
  backdropUrl:    string;
  isFeatured:     boolean;
  genres:         GenreDto[];
  episodes?:      EpisodeDto[];
}

export interface ProfileDto {
  id:            string;
  name:          string;
  avatarUrl:     string;
  isKidsProfile: boolean;
}

export interface WatchProgressDto {
  contentId:      string;
  episodeId?:     string | null;
  secondsWatched: number;
  completed:      boolean;
}
