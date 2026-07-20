import Redis from "ioredis";

let _client: Redis | null = null;

export function getRedis(): Redis {
  if (!_client) {
    _client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
    _client.on("error", (e) => console.error("[redis] error:", e.message));
  }
  return _client;
}
