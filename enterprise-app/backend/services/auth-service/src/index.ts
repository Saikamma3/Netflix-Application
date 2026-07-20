import "dotenv/config";
import express from "express";
import { authRouter } from "./auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service", timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Auth Service listening on port ${PORT}`);
});
