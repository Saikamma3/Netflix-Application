import Redis from "ioredis";
import { logger } from "./logger";

export const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => logger.info("Redis connected (auth-service)"));
redisClient.on("error", (err) => logger.error("Redis error", { error: err.message }));
