import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import { createRouter } from "./router";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (process.env.CORS_ORIGINS || "http://localhost:5173").split(","),
  credentials: true,
}));

// Correlation ID
app.use((req, res, next) => {
  const id = (req.headers["x-correlation-id"] as string) || uuidv4();
  req.headers["x-correlation-id"] = id;
  res.setHeader("X-Correlation-Id", id);
  next();
});

app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway", ts: new Date().toISOString() });
});

app.use("/", createRouter());
app.use(errorHandler);

app.listen(PORT, () => console.log(`[api-gateway] listening on ${PORT}`));
