# Enterprise Application Architecture

## Overview

Full-stack enterprise application using a microservices architecture pattern. Each layer is independently deployable, horizontally scalable, and communicates via well-defined interfaces.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                │
│                                                                     │
│   ┌─────────────────────────────────────────────┐                  │
│   │         React + TypeScript SPA               │                  │
│   │   Redux Toolkit │ Axios │ React Router       │                  │
│   └───────────────────────┬─────────────────────┘                  │
└───────────────────────────┼─────────────────────────────────────────┘
                            │  HTTPS
┌───────────────────────────▼─────────────────────────────────────────┐
│                        EDGE / GATEWAY TIER                          │
│                                                                     │
│   ┌─────────────────────────────────────────────┐                  │
│   │              NGINX Reverse Proxy             │                  │
│   │   SSL Termination │ Load Balancing │ WAF     │                  │
│   └───────────────────────┬─────────────────────┘                  │
│                           │                                         │
│   ┌───────────────────────▼─────────────────────┐                  │
│   │              API Gateway (Node.js)           │                  │
│   │   Auth Check │ Rate Limiting │ Routing       │                  │
│   │   Request Logging │ Response Caching         │                  │
│   └─────┬───────────────┬───────────────┬───────┘                  │
└─────────┼───────────────┼───────────────┼─────────────────────────┘
          │               │               │
┌─────────▼───────────────▼───────────────▼─────────────────────────┐
│                       SERVICE TIER (Microservices)                 │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Auth Service │  │ User Service │  │  (Future) Product Service│ │
│  │  Port: 3001  │  │  Port: 3002  │  │        Port: 3003        │ │
│  │  JWT / bcrypt│  │  CRUD / ORM  │  │  Catalog / Inventory     │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘ │
└─────────┼─────────────────┼──────────────────────── ┼─────────────┘
          │                 │                          │
┌─────────▼─────────────────▼──────────────────────── ▼─────────────┐
│                      MIDDLEWARE / SHARED LAYER                     │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Auth Middleware │  │  Rate Limiter    │  │ Logger (Winston) │  │
│  │  JWT Validation  │  │  (Redis-backed)  │  │  Morgan / Pino   │  │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────┐                         │
│  │ Error Handler   │  │  Correlation ID  │                         │
│  │ (Global)        │  │  Tracing         │                         │
│  └─────────────────┘  └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
          │                                   │
┌─────────▼───────────────┐    ┌──────────────▼─────────────────────┐
│      CACHE TIER          │    │           DATA TIER                │
│                         │    │                                     │
│  ┌─────────────────────┐│    │  ┌─────────────────────────────┐   │
│  │      Redis 7.x      ││    │  │    PostgreSQL 15             │   │
│  │  Session Storage    ││    │  │    Primary + Read Replica    │   │
│  │  Rate Limit Counts  ││    │  │    Prisma ORM               │   │
│  │  Response Cache     ││    │  └─────────────────────────────┘   │
│  │  Queue (Bull)       ││    │                                     │
│  └─────────────────────┘│    │  ┌─────────────────────────────┐   │
└─────────────────────────┘    │  │    Migrations & Seeds       │   │
                               │  └─────────────────────────────┘   │
                               └─────────────────────────────────────┘
```

---

## Technology Stack

| Layer          | Technology                        | Purpose                                |
|---------------|-----------------------------------|----------------------------------------|
| Frontend       | React 18, TypeScript, Redux Toolkit | SPA, state management                 |
| HTTP Client    | Axios + interceptors              | API calls, token refresh               |
| Edge           | NGINX                             | SSL, load balancing, WAF               |
| API Gateway    | Node.js + Express                 | Routing, auth check, rate limit        |
| Auth Service   | Node.js + Express + JWT + bcrypt  | Login, register, token lifecycle       |
| User Service   | Node.js + Express + Prisma        | User CRUD, profile management          |
| Middleware     | Express middleware chain          | Logging, error handling, correlation   |
| Cache          | Redis 7 (ioredis)                 | Session, rate limit, response cache    |
| Queue          | Bull (Redis-backed)               | Background jobs, email, notifications  |
| Database       | PostgreSQL 15 + Prisma ORM        | Persistent relational data             |
| Container      | Docker + Docker Compose           | Local and production orchestration     |

---

## Layer Descriptions

### 1. Frontend (`/frontend`)
React 18 Single Page Application with TypeScript. Communicates exclusively with the API Gateway via HTTPS. Uses Redux Toolkit for global state (auth tokens, user session) and React Query for server-state caching.

**Key patterns:**
- Axios instance with request interceptors (attach JWT) and response interceptors (auto token refresh on 401)
- Protected routes that check auth state before rendering
- Centralized API service modules per domain

### 2. NGINX (`/nginx`)
Entry point for all traffic. Handles:
- SSL/TLS termination
- Load balancing across API Gateway instances
- Static asset serving for the frontend build
- Basic WAF rules (rate limiting at network level)

### 3. API Gateway (`/backend/api-gateway`)
Single ingress for all service traffic. Responsibilities:
- Route requests to the correct downstream service
- Validate JWT tokens (shared secret with Auth Service)
- Apply rate limiting (backed by Redis counters)
- Attach correlation IDs to every request
- Aggregate responses where needed

### 4. Auth Service (`/backend/services/auth-service`)
Stateless JWT-based authentication:
- `POST /auth/register` — hash password with bcrypt, store user, issue tokens
- `POST /auth/login` — verify password, issue access token (15 min) + refresh token (7 days)
- `POST /auth/refresh` — validate refresh token from Redis, issue new access token
- `POST /auth/logout` — invalidate refresh token in Redis

### 5. User Service (`/backend/services/user-service`)
Business domain service for user management:
- Full CRUD on user records
- Reads from Redis cache first (cache-aside pattern), falls back to PostgreSQL
- Writes invalidate the relevant cache keys

### 6. Shared Middleware (`/backend/shared/middleware`)
Reusable Express middleware used across all services:
- **auth.middleware.ts** — Verify JWT, attach `req.user`
- **rateLimit.middleware.ts** — Sliding window counter in Redis
- **logger.middleware.ts** — Structured JSON logs with correlation ID
- **error.middleware.ts** — Centralized error shaping (never leak stack traces)

### 7. Redis Cache Layer (`/backend/shared/cache`)
Two Redis clients:
- **Session / token store** — Refresh tokens, blacklisted tokens
- **Application cache** — Response caching (TTL-based), rate limit counters

Cache invalidation strategy: write-through on mutations, TTL-based expiry on reads.

### 8. Database Layer (`/database`)
PostgreSQL with Prisma ORM:
- Schema-first migrations — all changes tracked in `/database/migrations`
- Read/write split: writes to primary, reads (where eventual consistency is OK) to replica
- Seeds for development and testing environments

---

## Data Flow — Authenticated Request

```
Browser
  │
  ├─[1] GET /api/users/me  (Authorization: Bearer <access_token>)
  │
  ▼
NGINX  ──► [2] Proxy to API Gateway :3000
  │
  ▼
API Gateway
  ├─[3] Logger middleware: assign correlation-id, log incoming request
  ├─[4] Auth middleware: verify JWT signature + expiry
  ├─[5] Rate limit middleware: increment Redis counter, reject if exceeded
  └─[6] Route to User Service :3002
          │
          ▼
        User Service
          ├─[7] Check Redis cache for user:{id}
          │       ├─ HIT  ──► [8] Return cached response
          │       └─ MISS ──► [9] Query PostgreSQL
          │                        └─[10] Store in Redis (TTL 300s)
          └─[11] Return user JSON
                  │
                  ▼
            API Gateway ──► [12] Forward response to NGINX ──► Browser
```

---

## Environment Variables

All services use a shared `.env.example` as the reference. Each service reads only the variables it needs.

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/enterprise_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=<256-bit secret>
JWT_REFRESH_SECRET=<256-bit secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Services
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
API_GATEWAY_PORT=3000

# App
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGINS=https://yourdomain.com
```

---

## Running Locally

```bash
# 1. Start infrastructure
docker-compose up -d postgres redis

# 2. Run migrations
cd database && npx prisma migrate dev

# 3. Seed database
npx ts-node seeds/seed.ts

# 4. Start all services
docker-compose up
```

---

## Security Considerations

| Concern                  | Mitigation                                              |
|--------------------------|--------------------------------------------------------|
| Token theft              | Short-lived access tokens (15 min), HttpOnly refresh   |
| Brute force login        | Redis-backed rate limiting per IP + per account        |
| SQL injection            | Prisma parameterized queries (no raw SQL in hot paths) |
| XSS                      | CSP headers via NGINX, sanitized React rendering       |
| CSRF                     | SameSite cookies + CORS allow-list                     |
| Secret leakage           | Secrets via env vars, never in code or logs            |
| Dependency vulnerabilities | `npm audit` in CI, Dependabot enabled                |

---

## Scaling Strategy

- **API Gateway** — Horizontal scaling behind NGINX (stateless, all state in Redis)
- **Auth Service** — Stateless; scale horizontally
- **User Service** — Stateless; add read replicas to PostgreSQL for read-heavy load
- **Redis** — Redis Cluster mode for horizontal cache scaling
- **PostgreSQL** — Primary + N read replicas; connection pooling via PgBouncer

---

## Directory Structure

```
enterprise-app/
├── ARCHITECTURE.md           ← This file
├── docker-compose.yml        ← Full stack orchestration
├── .env.example              ← Environment variable reference
├── nginx/
│   └── nginx.conf            ← Reverse proxy configuration
├── frontend/                 ← React 18 + TypeScript SPA
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── api/              ← Axios client + domain API modules
│       ├── store/            ← Redux Toolkit slices
│       ├── components/       ← Shared UI components
│       └── pages/            ← Route-level page components
├── backend/
│   ├── api-gateway/          ← Express routing + proxy
│   ├── services/
│   │   ├── auth-service/     ← JWT auth microservice
│   │   └── user-service/     ← User CRUD microservice
│   └── shared/
│       ├── middleware/        ← Reusable Express middleware
│       ├── cache/             ← Redis client + cache service
│       └── types/             ← Shared TypeScript interfaces
└── database/
    ├── prisma/               ← Prisma schema
    ├── migrations/           ← SQL migration files
    └── seeds/                ← Dev/test seed data
```
