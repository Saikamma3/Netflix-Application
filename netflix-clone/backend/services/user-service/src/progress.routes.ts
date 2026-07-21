import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const progressRouter = Router();
const prisma = new PrismaClient();

progressRouter.get("/", async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"] as string;
    if (!profileId) { res.status(400).json({ success: false, error: "No profile selected" }); return; }

    const rows = await prisma.watchProgress.findMany({
      where: { profileId, completed: false },
      include: { content: { include: { genres: { include: { genre: true } } } }, episode: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

progressRouter.get("/:contentId", async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"] as string;
    if (!profileId) { res.status(400).json({ success: false, error: "No profile selected" }); return; }

    const row = await prisma.watchProgress.findFirst({
      where: { profileId, contentId: req.params.contentId },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ success: true, data: row });
  } catch (e) { next(e); }
});

progressRouter.post("/", async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"] as string;
    const { contentId, episodeId = null, secondsWatched, completed = false } = req.body;

    if (!profileId || !contentId || secondsWatched === undefined) {
      res.status(400).json({ success: false, error: "contentId and secondsWatched required" }); return;
    }

    // Validate secondsWatched — must be a non-negative number, max 24 hours
    const secs = Number(secondsWatched);
    if (!Number.isFinite(secs) || secs < 0 || secs > 86400) {
      res.status(400).json({ success: false, error: "secondsWatched must be between 0 and 86400" }); return;
    }

    const row = await prisma.watchProgress.upsert({
      where: { profileId_contentId_episodeId: { profileId, contentId, episodeId: episodeId ?? "" } },
      update: { secondsWatched: Math.floor(secs), completed: !!completed },
      create: { profileId, contentId, episodeId, secondsWatched: Math.floor(secs), completed: !!completed },
    });
    res.json({ success: true, data: row });
  } catch (e) { next(e); }
});
