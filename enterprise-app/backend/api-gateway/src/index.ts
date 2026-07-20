import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import { createRouter } from "./router";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || "http://localhost:5173").split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-Id"],
  })
);

// ── Correlation ID ────────────────────────────────────────────────────
app.use((req, res, next) => {
  const id = (req.headers["x-correlation-id"] as string) || uuidv4();
  req.headers["x-correlation-id"] = id;
  res.setHeader("X-Correlation-Id", id);
  next();
});

// ── Logging ───────────────────────────────────────────────────────────
app.use(
  morgan(
    ':remote-addr ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms correlationId=:req[x-correlation-id]',
    { stream: { write: (msg) => logger.http(msg.trim()) } }
  )
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway", timestamp: new Date().toISOString() });
});

// ── Routes (proxy to microservices) ──────────────────────────────────
app.use("/api", createRouter());

// ── Global error handler ──────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
});

export default app;
