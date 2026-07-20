import Redis, { RedisOptions } from "ioredis";

const options: RedisOptions = {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
    return targetErrors.some((e) => err.message.includes(e));
  },
};

// Singleton clients to avoid connection leaks across hot-reloads
let _appCache: Redis | null   = null;
let _sessionStore: Redis | null = null;

export function getAppCache(): Redis {
  if (!_appCache) {
    _appCache = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      ...options,
      db: 0, // Application cache DB
    });
  }
  return _appCache;
}

export function getSessionStore(): Redis {
  if (!_sessionStore) {
    _sessionStore = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      ...options,
      db: 1, // Session / token store DB (separate logical DB)
    });
  }
  return _sessionStore;
}
