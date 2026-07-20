import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { cache } from "../../../shared/cache/cache.service";

export const profileRouter = Router();
const prisma = new PrismaClient();

// GET /profiles — list all profiles for the logged-in user
profileRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const profiles = await cache.getOrSet(`profiles:${userId}`, () =>
      prisma.profile.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), 120);
    res.json({ success: true, data: profiles });
  } catch (e) { next(e); }
});

// POST /profiles — create a new profile (max 5)
profileRouter.post("/", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const count = await prisma.profile.count({ where: { userId } });
    if (count >= 5) { res.status(400).json({ success: false, error: "Maximum 5 profiles allowed" }); return; }
    const { name, avatarUrl, isKidsProfile } = req.body;
    const profile = await prisma.profile.create({ data: { userId, name, avatarUrl, isKidsProfile: !!isKidsProfile } });
    await cache.del(`profiles:${userId}`);
    res.status(201).json({ success: true, data: profile });
  } catch (e) { next(e); }
});

// DELETE /profiles/:id
profileRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const profile = await prisma.profile.findFirst({ where: { id: req.params.id, userId } });
    if (!profile) { res.status(404).json({ success: false, error: "Profile not found" }); return; }
    await prisma.profile.delete({ where: { id: req.params.id } });
    await cache.del(`profiles:${userId}`);
    res.status(204).send();
  } catch (e) { next(e); }
});
