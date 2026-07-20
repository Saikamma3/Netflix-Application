import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { getRedis } from "../../shared/cache/redis.client";

const store = () =>
  new RedisStore({
    sendCommand: (...args: string[]) => getRedis().call(...args) as Promise<unknown>,
  });

export const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: store(),
  message: { success: false, error: "Too many requests" },
});

export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: store(),
  message: { success: false, error: "Too many auth attempts" },
  keyGenerator: (req) => req.ip || "unknown",
});
