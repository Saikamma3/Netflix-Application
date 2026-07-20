import { getAppCache } from "./redis.client";

/**
 * Generic cache-aside helper.
 *
 * Usage:
 *   const user = await cacheService.getOrSet("user:123", () => db.findUser("123"), 300);
 */
export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await getAppCache().get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  },

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    await getAppCache().set(key, JSON.stringify(value), "EX", ttlSeconds);
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await getAppCache().del(...keys);
  },

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await getAppCache().keys(pattern);
    if (keys.length) await getAppCache().del(...keys);
  },

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const client = getAppCache();
    const count = await client.incr(key);
    if (ttlSeconds && count === 1) {
      await client.expire(key, ttlSeconds);
    }
    return count;
  },
};
