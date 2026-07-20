export type ContentType = "MOVIE" | "SHOW";

export interface Genre {
  id:   string;
  name: string;
  slug: string;
}

export interface Content {
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
  genres:         Genre[];
  episodes?:      Episode[];
}

export interface Episode {
  id:            string;
  season:        number;
  episodeNumber: number;
  title:         string;
  description:   string;
  duration:      number;
  thumbnailUrl:  string | null;
}

export interface Profile {
  id:            string;
  name:          string;
  avatarUrl:     string;
  isKidsProfile: boolean;
}

export interface TokenPair {
  accessToken:  string;
  refreshToken: string;
}

export interface WatchProgress {
  contentId:      string;
  episodeId:      string | null;
  secondsWatched: number;
  completed:      boolean;
  content?:       Content;
}
