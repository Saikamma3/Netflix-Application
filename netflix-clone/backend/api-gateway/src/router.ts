import { Router } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { authGuard } from "./middleware/auth.middleware";
import { rateLimiter, authRateLimiter } from "./middleware/rateLimit.middleware";

const proxy = (target: string, pathRewrite: Record<string, string>): ReturnType<typeof createProxyMiddleware> =>
  createProxyMiddleware<Options>({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (_err, _req, res) => {
        (res as import("express").Response)
          .status(502)
          .json({ success: false, error: "Service unavailable" });
      },
    },
  });

export function createRouter(): Router {
  const r = Router();

  const AUTH    = process.env.AUTH_SERVICE_URL    || "http://localhost:3001";
  const CONTENT = process.env.CONTENT_SERVICE_URL || "http://localhost:3002";
  const USER    = process.env.USER_SERVICE_URL    || "http://localhost:3003";
  const STREAM  = process.env.STREAMING_SERVICE_URL || "http://localhost:3004";

  // Public auth routes
  r.use("/api/auth", authRateLimiter,
    proxy(AUTH, { "^/api/auth": "/auth" }));

  // Protected API routes
  r.use("/api/content", rateLimiter, authGuard,
    proxy(CONTENT, { "^/api/content": "/content" }));

  r.use("/api/profiles", rateLimiter, authGuard,
    proxy(USER, { "^/api/profiles": "/profiles" }));

  r.use("/api/watchlist", rateLimiter, authGuard,
    proxy(USER, { "^/api/watchlist": "/watchlist" }));

  r.use("/api/progress", rateLimiter, authGuard,
    proxy(USER, { "^/api/progress": "/progress" }));

  // Streaming — auth guard but no rate limit (HLS segments are many small requests)
  r.use("/stream", authGuard,
    proxy(STREAM, { "^/stream": "/stream" }));

  return r;
}
