import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const progressRouter = Router();
const prisma = new PrismaClient();

// GET /progress — continue watching list
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

// GET /progress/:contentId — progress for a specific title
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

// POST /progress  { contentId, episodeId?, secondsWatched, completed? }
progressRouter.post("/", async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"] as string;
    const { contentId, episodeId = null, secondsWatched, completed = false } = req.body;
    if (!profileId || !contentId || secondsWatched === undefined) {
      res.status(400).json({ success: false, error: "contentId and secondsWatched required" });
      return;
    }

    const row = await prisma.watchProgress.upsert({
      where: { profileId_contentId_episodeId: { profileId, contentId, episodeId: episodeId ?? "" } },
      update: { secondsWatched, completed },
      create: { profileId, contentId, episodeId, secondsWatched, completed },
    });
    res.json({ success: true, data: row });
  } catch (e) { next(e); }
});
