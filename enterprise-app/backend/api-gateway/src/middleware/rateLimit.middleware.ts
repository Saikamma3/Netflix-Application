import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../redis";

const store = new RedisStore({
  sendCommand: (...args: string[]) => redisClient.call(...args) as Promise<unknown>,
});

export const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  store,
  message: { success: false, error: "Too many requests, please try again later." },
  keyGenerator: (req) =>
    (req.headers["x-user-id"] as string) || req.ip || "unknown",
});

export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store,
  message: { success: false, error: "Too many login attempts, please wait." },
  keyGenerator: (req) => req.ip || "unknown",
});
