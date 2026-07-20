-- Netflix Clone — Initial Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE content_type       AS ENUM ('MOVIE', 'SHOW');
CREATE TYPE subscription_tier  AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
CREATE TYPE rating_value       AS ENUM ('THUMBS_UP', 'THUMBS_DOWN');

-- Users
CREATE TABLE users (
  id                UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             VARCHAR(320)    NOT NULL UNIQUE,
  password_hash     TEXT            NOT NULL,
  subscription_tier subscription_tier NOT NULL DEFAULT 'BASIC',
  is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Profiles
CREATE TABLE profiles (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(50) NOT NULL,
  avatar_url      TEXT        NOT NULL DEFAULT '/avatars/default.png',
  is_kids_profile BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Genres
CREATE TABLE genres (
  id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(64) NOT NULL UNIQUE,
  slug VARCHAR(64) NOT NULL UNIQUE
);

-- Content
CREATE TABLE content (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255) NOT NULL,
  description     TEXT         NOT NULL,
  type            content_type NOT NULL,
  release_year    SMALLINT     NOT NULL,
  maturity_rating VARCHAR(10)  NOT NULL DEFAULT 'PG-13',
  duration        SMALLINT,        -- minutes (null for shows)
  poster_url      TEXT         NOT NULL,
  backdrop_url    TEXT         NOT NULL,
  trailer_key     TEXT,            -- MinIO key
  video_key       TEXT,            -- MinIO key (movies only)
  is_featured     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_type       ON content(type);
CREATE INDEX idx_content_is_featured ON content(is_featured);

-- Content ↔ Genre (many-to-many)
CREATE TABLE content_genres (
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  genre_id   UUID NOT NULL REFERENCES genres(id)  ON DELETE CASCADE,
  PRIMARY KEY (content_id, genre_id)
);

-- Episodes (TV shows)
CREATE TABLE episodes (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id     UUID        NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  season         SMALLINT    NOT NULL,
  episode_number SMALLINT    NOT NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT        NOT NULL,
  duration       SMALLINT    NOT NULL,
  video_key      TEXT        NOT NULL,
  thumbnail_url  TEXT,
  UNIQUE(content_id, season, episode_number)
);
CREATE INDEX idx_episodes_content_id ON episodes(content_id);

-- Watchlist
CREATE TABLE watchlist (
  profile_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID        NOT NULL REFERENCES content(id)  ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, content_id)
);

-- Watch Progress
CREATE TABLE watch_progress (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id       UUID        NOT NULL REFERENCES content(id)  ON DELETE CASCADE,
  episode_id       UUID        REFERENCES episodes(id) ON DELETE SET NULL,
  seconds_watched  INT         NOT NULL DEFAULT 0,
  completed        BOOLEAN     NOT NULL DEFAULT FALSE,
  watched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, content_id, episode_id)
);
CREATE INDEX idx_watch_progress_profile ON watch_progress(profile_id);

-- Ratings
CREATE TABLE ratings (
  profile_id UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID         NOT NULL REFERENCES content(id)  ON DELETE CASCADE,
  value      rating_value NOT NULL,
  rated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, content_id)
);

-- Auto updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER wp_updated_at      BEFORE UPDATE ON watch_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();
