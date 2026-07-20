import { getRedis } from "./redis.client";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await getRedis().get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    await getRedis().set(key, JSON.stringify(value), "EX", ttl);
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await getRedis().del(...keys);
  },

  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl = 300): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) return hit;
    const fresh = await fn();
    await this.set(key, fresh, ttl);
    return fresh;
  },
};
