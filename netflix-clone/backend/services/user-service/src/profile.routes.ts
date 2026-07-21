import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { cache } from "../../../shared/cache/cache.service";

export const profileRouter = Router();
const prisma = new PrismaClient();

profileRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const profiles = await cache.getOrSet(`profiles:${userId}`, () =>
      prisma.profile.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), 120);
    res.json({ success: true, data: profiles });
  } catch (e) { next(e); }
});

profileRouter.post("/", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    const { name, avatarUrl, isKidsProfile } = req.body;

    // Validate name
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Profile name is required" }); return;
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      res.status(400).json({ success: false, error: "Profile name must be 1-50 characters" }); return;
    }

    // Validate avatarUrl if provided
    if (avatarUrl !== undefined) {
      if (typeof avatarUrl !== "string" || avatarUrl.length > 500) {
        res.status(400).json({ success: false, error: "Invalid avatarUrl" }); return;
      }
      // Only allow relative paths or https URLs
      if (avatarUrl && !avatarUrl.startsWith("/") && !avatarUrl.startsWith("https://")) {
        res.status(400).json({ success: false, error: "avatarUrl must be a relative path or https URL" }); return;
      }
    }

    const count = await prisma.profile.count({ where: { userId } });
    if (count >= 5) { res.status(400).json({ success: false, error: "Maximum 5 profiles allowed" }); return; }

    const profile = await prisma.profile.create({
      data: { userId, name: trimmedName, avatarUrl, isKidsProfile: !!isKidsProfile },
    });
    await cache.del(`profiles:${userId}`);
    res.status(201).json({ success: true, data: profile });
  } catch (e) { next(e); }
});

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
