import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { cache } from "../../../shared/cache/cache.service";

export const watchlistRouter = Router();
const prisma = new PrismaClient();

const key = (profileId: string) => `watchlist:${profileId}`;

// GET /watchlist
watchlistRouter.get("/", async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"] as string;
    if (!profileId) { res.status(400).json({ success: false, error: "No profile selected" }); return; }

    const items = await cache.getOrSet(key(profileId), () =>
      prisma.watchlist.findMany({
        where: { profileId },
        include: { content: { include: { genres: { include: { genre: true } } } } },
        orderBy: { addedAt: "desc" },
      }), 60);

    res.json({ success: true, data: items.map((i: { content: unknown }) => i.content) });
  } catch (e) { next(e); }
});

// POST /watchlist  { contentId }
watchlistRouter.post("/", async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"] as string;
    const { contentId } = req.body;
    if (!profileId || !contentId) { res.status(400).json({ success: false, error: "profileId and contentId required" }); return; }

    await prisma.watchlist.upsert({
      where: { profileId_contentId: { profileId, contentId } },
      update: {},
      create: { profileId, contentId },
    });
    await cache.del(key(profileId));
    res.status(201).json({ success: true });
  } catch (e) { next(e); }
});

// DELETE /watchlist/:contentId
watchlistRouter.delete("/:contentId", async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"] as string;
    if (!profileId) { res.status(400).json({ success: false, error: "No profile selected" }); return; }

    await prisma.watchlist.delete({
      where: { profileId_contentId: { profileId, contentId: req.params.contentId } },
    });
    await cache.del(key(profileId));
    res.status(204).send();
  } catch (e) { next(e); }
});
