import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authGuard } from "./middleware/auth.middleware";
import { rateLimiter, authRateLimiter } from "./middleware/rateLimit.middleware";

export function createRouter(): Router {
  const router = Router();

  const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
  const USER_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:3002";

  const proxyOptions = (target: string) => ({
    target,
    changeOrigin: true,
    on: {
      error: (err: Error, _req: unknown, res: unknown) => {
        const response = res as { status: (code: number) => { json: (body: unknown) => void } };
        response.status(502).json({ success: false, error: "Service temporarily unavailable" });
      },
    },
  });

  // ── Auth routes (no JWT guard — these issue tokens) ─────────────────
  router.use(
    "/auth",
    authRateLimiter,
    createProxyMiddleware({
      ...proxyOptions(AUTH_SERVICE),
      pathRewrite: { "^/api/auth": "/auth" },
    })
  );

  // ── User routes (JWT required) ──────────────────────────────────────
  router.use(
    "/users",
    rateLimiter,
    authGuard,
    createProxyMiddleware({
      ...proxyOptions(USER_SERVICE),
      pathRewrite: { "^/api/users": "/users" },
    })
  );

  return router;
}
