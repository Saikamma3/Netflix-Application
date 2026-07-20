import "dotenv/config";
import express from "express";
import { authRouter } from "./auth.routes";
import { requestLogger } from "../../../shared/middleware/logger.middleware";
import { errorHandler, notFound } from "../../../shared/middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth-service" }));
app.use("/auth", authRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`[auth-service] listening on ${PORT}`));
