import "dotenv/config";
import express from "express";
import { userRouter } from "./user.routes";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user-service", timestamp: new Date().toISOString() });
});

app.use("/users", userRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`User Service listening on port ${PORT}`);
});
