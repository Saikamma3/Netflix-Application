import "dotenv/config";
import express from "express";
import { contentRouter } from "./content.routes";
import { requestLogger } from "../../../shared/middleware/logger.middleware";
import { errorHandler, notFound } from "../../../shared/middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json({ limit: "16kb" }));
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "content-service" }));
app.use("/content", contentRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`[content-service] listening on ${PORT}`));
