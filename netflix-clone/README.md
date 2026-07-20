# Netflix Clone — Enterprise Application

A full-stack Netflix-inspired video streaming platform built with a microservices architecture. Designed for deployment practice: every layer runs in Docker, infrastructure boots with a single command, and the app mirrors real-world enterprise patterns.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Services & Ports](#services--ports)
- [API Reference](#api-reference)
- [Video Setup (HLS)](#video-setup-hls)
- [Project Structure](#project-structure)
- [Development (Local without Docker)](#development-local-without-docker)
- [Database](#database)
- [Phase 2 Roadmap](#phase-2-roadmap)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (React SPA)                         │
│         Login → Profile Select → Browse → Watch                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP
                    ┌──────▼──────┐
                    │    NGINX    │  Port 80
                    │  (Reverse   │  SSL · Load Balance · Rate Limit
                    │   Proxy)    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │  Port 3000
                    │             │  JWT Check · Rate Limit · Routing
                    └──┬──┬──┬───┘
          ┌────────────┘  │  └──────────────┐
          │               │                 │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐  ┌─────────────────┐
   │ Auth Service│ │Content Svc  │ │ User Service  │  │Streaming Service│
   │  Port 3001  │ │  Port 3002  │ │   Port 3003   │  │   Port 3004     │
   │             │ │             │ │               │  │                 │
   │ register    │ │ featured    │ │ profiles      │  │ HLS manifest    │
   │ login       │ │ genres      │ │ watchlist     │  │ .ts segments    │
   │ refresh     │ │ search      │ │ progress      │  │ (via MinIO)     │
   │ logout      │ │ episodes    │ │               │  │                 │
   └──────┬──────┘ └──────┬──────┘ └───────┬───────┘  └────────┬────────┘
          │               │                │                    │
   ┌──────▼───────────────▼────────────────▼────────┐  ┌───────▼────────┐
   │                   PostgreSQL 15                  │  │   MinIO        │
   │   users · profiles · content · episodes         │  │  (S3-compat)   │
   │   watchlist · watch_progress · ratings           │  │  HLS videos    │
   └──────────────────────────────────────────────────┘  └────────────────┘
          │
   ┌──────▼──────────────┐
   │       Redis 7        │
   │  Refresh tokens      │
   │  Content cache       │
   │  Rate limit counters │
   └─────────────────────┘
```

### Request Flow (Authenticated)

```
1. Browser sends:  GET /api/content/featured  (Authorization: Bearer <token>)
2. NGINX           → proxies to API Gateway :3000
3. API Gateway     → verifies JWT signature + expiry
4. API Gateway     → checks Redis rate limit counter (per user)
5. API Gateway     → forwards to Content Service :3002 (injects x-user-id header)
6. Content Service → checks Redis cache: content:featured
                      HIT  → return cached JSON (TTL 10 min)
                      MISS → query PostgreSQL → cache → return
7. Response flows back through API Gateway → NGINX → Browser
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + TypeScript | 18 / 5 |
| Styling | Tailwind CSS | 3 |
| State | Redux Toolkit | 2 |
| HTTP Client | Axios (with auto token refresh) | 1.6 |
| Video Player | hls.js (HLS adaptive bitrate) | 1.4 |
| Build Tool | Vite | 5 |
| API Gateway | Node.js + Express | 20 / 4.18 |
| Auth Service | Node.js + JWT + bcrypt | — |
| Content Service | Node.js + Prisma ORM | — |
| User Service | Node.js + Prisma ORM | — |
| Streaming Service | Node.js + AWS SDK (S3/MinIO) | — |
| Database | PostgreSQL | 15 |
| Cache / Sessions | Redis | 7 |
| Object Storage | MinIO (S3-compatible) | latest |
| Reverse Proxy | NGINX | alpine |
| Containers | Docker + Docker Compose | — |

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker Desktop | 24+ | Run all services |
| Docker Compose | 2.20+ | Orchestrate containers |
| Node.js *(optional)* | 20+ | Local development only |
| ffmpeg *(optional)* | 6+ | Convert videos to HLS |

---

## Quick Start

```bash
# 1. Clone and enter the project
cd "c:/Users/bhask/Projects/Git Learning/netflix-clone"

# 2. Create your environment file
cp .env.example .env
# Edit .env and change secrets for production!

# 3. Start the full stack
docker-compose up --build

# 4. Run database migrations (first time only)
docker exec -it netflix_auth npx prisma migrate deploy

# 5. Seed the database with sample content
docker exec -it netflix_auth npx ts-node database/seeds/seed.ts
```

Open your browser at **http://localhost**

### Demo Credentials

| Field | Value |
|---|---|
| Email | `demo@netflix.local` |
| Password | `Netflix@123!` |

---

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
# Database
POSTGRES_USER=netflix
POSTGRES_PASSWORD=netflixpass          # Change in production
POSTGRES_DB=netflix_db
DATABASE_URL=postgresql://netflix:netflixpass@postgres:5432/netflix_db

# Redis
REDIS_PASSWORD=redispass               # Change in production
REDIS_URL=redis://:redispass@redis:6379

# MinIO (local S3)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123      # Change in production
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=netflix-content
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# JWT — MUST be changed before any real deployment
JWT_ACCESS_SECRET=netflix-access-secret-change-in-prod
JWT_REFRESH_SECRET=netflix-refresh-secret-change-in-prod
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Service URLs (internal Docker network)
AUTH_SERVICE_URL=http://auth-service:3001
CONTENT_SERVICE_URL=http://content-service:3002
USER_SERVICE_URL=http://user-service:3003
STREAMING_SERVICE_URL=http://streaming-service:3004

# App
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGINS=http://localhost

# Frontend
VITE_API_BASE_URL=/api
VITE_STREAM_BASE_URL=/stream
```

> **Security note**: Never commit `.env` to version control. It is already in `.gitignore`.

---

## Services & Ports

| Service | Container | Port | UI / Endpoint |
|---|---|---|---|
| NGINX (edge) | `netflix_nginx` | **80** | Main entry point for browser |
| API Gateway | `netflix_gateway` | 3000 | `/api/*` and `/stream/*` |
| Auth Service | `netflix_auth` | 3001 | Internal only |
| Content Service | `netflix_content` | 3002 | Internal only |
| User Service | `netflix_users` | 3003 | Internal only |
| Streaming Service | `netflix_streaming` | 3004 | Internal only |
| PostgreSQL | `netflix_postgres` | 5432 | DB client access |
| Redis | `netflix_redis` | 6379 | Redis CLI access |
| MinIO API | `netflix_minio` | 9000 | S3 API |
| MinIO Console | `netflix_minio` | **9001** | http://localhost:9001 |

### Useful commands

```bash
# View logs for a specific service
docker-compose logs -f auth-service

# Restart a single service
docker-compose restart content-service

# Open a shell inside a container
docker exec -it netflix_postgres psql -U netflix -d netflix_db

# Connect to Redis
docker exec -it netflix_redis redis-cli -a redispass

# Stop everything
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v
```

---

## API Reference

All routes go through the API Gateway at `http://localhost:3000`.  
Protected routes require `Authorization: Bearer <accessToken>` header.

### Auth  `/api/auth`  — Public

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ email, password }` | `{ accessToken, refreshToken }` |
| `POST` | `/api/auth/login` | `{ email, password }` | `{ accessToken, refreshToken }` |
| `POST` | `/api/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `POST` | `/api/auth/logout` | — | `{ success: true }` |
| `POST` | `/api/auth/select-profile` | `{ profileId }` | New tokens with `profileId` embedded |

> After login, the user lands on the **Profile Select** screen. Calling `select-profile` re-issues tokens that contain the active `profileId`. All subsequent requests use those tokens so the user service knows which profile is active.

### Profiles  `/api/profiles`  — Protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profiles` | List all profiles for the account |
| `POST` | `/api/profiles` | Create a new profile (max 5) |
| `DELETE` | `/api/profiles/:id` | Delete a profile |

### Content  `/api/content`  — Protected

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/content/featured` | — | Featured content for hero banner |
| `GET` | `/api/content/genres` | — | All genres |
| `GET` | `/api/content/by-genre/:slug` | `page`, `pageSize` | Content in a genre |
| `GET` | `/api/content/search` | `q` (min 2 chars) | Full-text search |
| `GET` | `/api/content/:id` | — | Single content item |
| `GET` | `/api/content/:id/episodes` | `season` (optional) | Episodes for a show |

### Watchlist  `/api/watchlist`  — Protected

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/api/watchlist` | — | Get My List |
| `POST` | `/api/watchlist` | `{ contentId }` | Add to My List |
| `DELETE` | `/api/watchlist/:contentId` | — | Remove from My List |

### Watch Progress  `/api/progress`  — Protected

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/api/progress` | — | Continue Watching row |
| `GET` | `/api/progress/:contentId` | — | Progress for one title |
| `POST` | `/api/progress` | `{ contentId, secondsWatched, episodeId?, completed? }` | Save progress |

### Streaming  `/stream`  — Protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stream/:path/manifest.m3u8` | HLS manifest (proxied from MinIO) |
| `GET` | `/stream/:path/:segment.ts` | HLS transport stream segment |
| `GET` | `/stream/:path/:segment.m4s` | fMP4 segment (if using CMAF HLS) |

---

## Video Setup (HLS)

The streaming service proxies video files stored in **MinIO**. To add real video content:

### Step 1 — Download a test video

```bash
# Big Buck Bunny (Creative Commons — safe for testing)
curl -L "https://download.blender.org/demo/movies/BBB/big_buck_bunny_720p_h264.mov" -o bbb.mov
```

### Step 2 — Convert to HLS with ffmpeg

```bash
mkdir -p hls/movies/big-buck-bunny

ffmpeg -i bbb.mov \
  -profile:v baseline -level 3.0 \
  -start_number 0 \
  -hls_time 10 \
  -hls_list_size 0 \
  -hls_segment_filename "hls/movies/big-buck-bunny/seg%03d.ts" \
  -f hls \
  hls/movies/big-buck-bunny/manifest.m3u8
```

### Step 3 — Upload to MinIO

Open the MinIO console at **http://localhost:9001**  
Login: `minioadmin` / `minioadmin123`

1. Create a bucket named `netflix-content`
2. Upload the entire `hls/movies/big-buck-bunny/` folder

Or use the MinIO CLI:

```bash
# Install mc (MinIO client)
mc alias set local http://localhost:9000 minioadmin minioadmin123
mc mb local/netflix-content
mc cp --recursive hls/ local/netflix-content/
```

### How the video key maps to the player

The seed data sets `videoKey = "movies/big-buck-bunny/manifest.m3u8"` for the movie records.  
The streaming service converts this to a MinIO object path:
```
GET /stream/movies/big-buck-bunny/manifest.m3u8
→ MinIO: netflix-content/movies/big-buck-bunny/manifest.m3u8
```

---

## Project Structure

```
netflix-clone/
│
├── README.md                          ← This file
├── docker-compose.yml                 ← Full stack orchestration
├── .env.example                       ← Environment variable reference
│
├── nginx/
│   ├── nginx.conf                     ← Reverse proxy, rate limiting
│   └── proxy_params.conf              ← Shared proxy headers
│
├── database/
│   ├── prisma/schema.prisma           ← Data model (User, Profile, Content...)
│   ├── migrations/001_init.sql        ← SQL run on first DB boot
│   └── seeds/seed.ts                  ← Sample movies, shows, demo user
│
├── backend/
│   │
│   ├── shared/                        ← Code shared across all services
│   │   ├── types/index.ts             ← TypeScript interfaces & DTOs
│   │   ├── middleware/
│   │   │   ├── error.middleware.ts    ← Global error handler
│   │   │   └── logger.middleware.ts   ← Request/response logger
│   │   └── cache/
│   │       ├── redis.client.ts        ← Redis singleton
│   │       └── cache.service.ts       ← getOrSet, del, invalidate helpers
│   │
│   ├── api-gateway/                   ← Port 3000 — single ingress
│   │   └── src/
│   │       ├── index.ts               ← Express app, CORS, helmet
│   │       ├── router.ts              ← Proxy rules to each service
│   │       └── middleware/
│   │           ├── auth.middleware.ts  ← JWT verification
│   │           ├── rateLimit.middleware.ts ← Redis-backed sliding window
│   │           └── error.middleware.ts
│   │
│   └── services/
│       │
│       ├── auth-service/              ← Port 3001
│       │   └── src/
│       │       ├── auth.routes.ts
│       │       ├── auth.controller.ts
│       │       └── auth.service.ts    ← bcrypt, JWT issue/refresh/revoke
│       │
│       ├── content-service/           ← Port 3002
│       │   └── src/
│       │       ├── content.routes.ts
│       │       ├── content.controller.ts
│       │       └── content.service.ts ← Cache-aside, search, episodes
│       │
│       ├── user-service/              ← Port 3003
│       │   └── src/
│       │       ├── profile.routes.ts
│       │       ├── watchlist.routes.ts
│       │       └── progress.routes.ts ← Continue Watching logic
│       │
│       └── streaming-service/         ← Port 3004
│           └── src/
│               ├── stream.routes.ts   ← Proxy HLS from MinIO
│               └── minio.ts           ← S3 client (works with AWS S3 too)
│
└── frontend/                          ← React 18 + TypeScript + Tailwind
    └── src/
        ├── App.tsx                    ← Router — public / auth / profile guards
        ├── api/
        │   ├── client.ts              ← Axios + auto token refresh on 401
        │   ├── auth.api.ts
        │   ├── content.api.ts
        │   └── user.api.ts
        ├── store/
        │   ├── index.ts               ← Redux store
        │   └── auth.slice.ts          ← Login, profile selection, logout
        ├── components/
        │   ├── Navbar.tsx             ← Transparent → solid on scroll
        │   ├── HeroBanner.tsx         ← Full-width hero with Play + My List
        │   ├── ContentRow.tsx         ← Horizontal scroll row with arrows
        │   ├── ContentCard.tsx        ← Poster + hover preview card
        │   ├── VideoPlayer.tsx        ← hls.js player, saves progress every 10s
        │   └── ProtectedRoute.tsx     ← JWT + profile-selection guards
        └── pages/
            ├── Login.tsx              ← Netflix-style sign in
            ├── Register.tsx           ← Account creation
            ├── ProfileSelect.tsx      ← "Who's watching?" screen
            ├── Browse.tsx             ← Home: hero + genre rows + continue watching
            ├── Search.tsx             ← Debounced live search
            ├── Watch.tsx              ← Full-screen player + episode selector
            └── MyList.tsx             ← Saved watchlist grid
```

---

## Development (Local without Docker)

To run individual services locally without Docker Compose:

### 1. Start infrastructure only

```bash
docker-compose up -d postgres redis minio
```

### 2. Install and run a service

```bash
# Auth Service
cd backend/services/auth-service
npm install
cp ../../.env.example .env   # edit DATABASE_URL and REDIS_URL to use localhost
npm run dev

# Content Service (new terminal)
cd backend/services/content-service
npm install && npm run dev

# User Service
cd backend/services/user-service
npm install && npm run dev

# Streaming Service
cd backend/services/streaming-service
npm install && npm run dev

# API Gateway
cd backend/api-gateway
npm install && npm run dev

# Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173 (Vite dev server, proxies /api to :3000)
```

### Run migrations and seed

```bash
cd backend/services/auth-service
npx prisma migrate dev    # applies migrations
npx prisma generate       # generates Prisma client

cd ../../../database/seeds
npx ts-node seed.ts
```

---

## Database

### Schema overview

```
users (1) ──── (many) profiles
                  │
          ┌───────┼───────┐
          │       │       │
       watchlist progress ratings
          │       │
       content  episode
          │
       content_genres ──── genres
```

### Useful Prisma commands

```bash
# View schema
npx prisma studio            # Opens a GUI at http://localhost:5555

# Create a new migration after schema change
npx prisma migrate dev --name add_new_field

# Reset database (drops all data)
npx prisma migrate reset

# Generate Prisma client after schema change
npx prisma generate
```

### Direct DB access

```bash
docker exec -it netflix_postgres psql -U netflix -d netflix_db

# Useful queries
SELECT id, email, subscription_tier FROM users;
SELECT title, type, is_featured FROM content ORDER BY release_year DESC;
SELECT p.name, COUNT(w.content_id) as watchlist_count
  FROM profiles p
  LEFT JOIN watchlist w ON w.profile_id = p.id
  GROUP BY p.name;
```

---

## Caching Strategy

| Data | Cache Key | TTL |
|---|---|---|
| Featured content | `content:featured` | 10 min |
| Content by genre | `content:genre:{slug}:{page}` | 5 min |
| Single content item | `content:{id}` | 10 min |
| Episode list | `episodes:{contentId}:{season}` | 10 min |
| User profiles | `profiles:{userId}` | 2 min |
| Watchlist | `watchlist:{profileId}` | 1 min |
| Refresh tokens | `refresh:{userId}` | 7 days |
| Rate limit counters | `rl:{ip}` | Per window |

Cache invalidation:
- **Watchlist** — invalidated on add/remove
- **Profiles** — invalidated on create/delete
- **Content** — time-based TTL only (admin mutations would call `cache.del`)

---

## Switching to AWS (Production)

The streaming service uses the AWS SDK v3 with `forcePathStyle: true` for MinIO. To switch to real S3:

1. In `.env`, set:
```env
MINIO_ENDPOINT=https://s3.amazonaws.com
MINIO_ACCESS_KEY=<your-aws-access-key-id>
MINIO_SECRET_KEY=<your-aws-secret-access-key>
MINIO_BUCKET=your-real-bucket-name
```

2. Remove `forcePathStyle: true` from [streaming-service/src/minio.ts](backend/services/streaming-service/src/minio.ts)

No other code changes needed.

---

## Phase 2 Roadmap

| Feature | Description |
|---|---|
| Recommendations | "Because you watched X" row based on watch history |
| Admin Panel | Upload content, manage metadata, view analytics |
| Ratings | Thumbs up/down stored per profile |
| Multiple video qualities | 360p / 720p / 1080p adaptive bitrate HLS |
| Email notifications | New releases via Bull queue + Nodemailer |
| Subscription tiers | Basic / Standard / Premium gating on quality |
| Trailer autoplay | Auto-muted trailer preview on content hover |
| Kubernetes manifests | Helm charts for cloud deployment (EKS / GKE) |

---

## Security Notes

| Concern | Mitigation |
|---|---|
| Token theft | 15-min access tokens + HttpOnly cookie option for refresh |
| Brute force | Redis rate limit: 10 auth requests / min per IP |
| Token revocation | Refresh tokens stored in Redis — logout instantly invalidates |
| SQL injection | Prisma parameterized queries — no raw SQL in application code |
| Video hotlinking | All stream URLs go through JWT-verified gateway |
| Secret leakage | All secrets via env vars, never hardcoded |
| CORS | Allowlist only — set `CORS_ORIGINS` to your domain |

---

## License

MIT — free to use for learning and deployment practice.
