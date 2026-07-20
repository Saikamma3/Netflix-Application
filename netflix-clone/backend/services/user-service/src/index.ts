import "dotenv/config";
import express from "express";
import { profileRouter }   from "./profile.routes";
import { watchlistRouter } from "./watchlist.routes";
import { progressRouter }  from "./progress.routes";
import { requestLogger }   from "../../../shared/middleware/logger.middleware";
import { errorHandler, notFound } from "../../../shared/middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "user-service" }));
app.use("/profiles",  profileRouter);
app.use("/watchlist", watchlistRouter);
app.use("/progress",  progressRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`[user-service] listening on ${PORT}`));
