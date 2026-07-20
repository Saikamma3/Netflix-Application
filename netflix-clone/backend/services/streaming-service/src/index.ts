import "dotenv/config";
import express from "express";
import { streamRouter } from "./stream.routes";
import { requestLogger } from "../../shared/middleware/logger.middleware";
import { errorHandler, notFound } from "../../shared/middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "streaming-service" }));
app.use("/stream", streamRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`[streaming-service] listening on ${PORT}`));
