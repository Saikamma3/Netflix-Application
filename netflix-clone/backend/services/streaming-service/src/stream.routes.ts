import { Router, Request, Response, NextFunction } from "express";
import { getObject } from "./minio";

export const streamRouter = Router();

// Reject keys containing path traversal sequences
function isSafeKey(key: string): boolean {
  return (
    key.length > 0 &&
    key.length < 512 &&
    !key.includes("..") &&
    !key.includes("//") &&
    !key.startsWith("/") &&
    /^[\w\-/.]+$/.test(key)   // only alphanumeric, dash, underscore, dot, slash
  );
}

streamRouter.get("/:key(*)/manifest.m3u8", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawKey = req.params.key;
    if (!isSafeKey(rawKey)) {
      res.status(400).json({ success: false, error: "Invalid stream key" });
      return;
    }
    const key    = `${rawKey}/manifest.m3u8`;
    const stream = await getObject(key);
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-cache");
    (stream as NodeJS.ReadableStream).pipe(res);
  } catch (e) { next(e); }
});

streamRouter.get("/:key(*).ts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawKey = req.params.key;
    if (!isSafeKey(rawKey)) {
      res.status(400).json({ success: false, error: "Invalid stream key" });
      return;
    }
    const key    = `${rawKey}.ts`;
    const stream = await getObject(key);
    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    (stream as NodeJS.ReadableStream).pipe(res);
  } catch (e) { next(e); }
});

streamRouter.get("/:key(*).m4s", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawKey = req.params.key;
    if (!isSafeKey(rawKey)) {
      res.status(400).json({ success: false, error: "Invalid stream key" });
      return;
    }
    const key    = `${rawKey}.m4s`;
    const stream = await getObject(key);
    res.setHeader("Content-Type", "video/iso.segment");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    (stream as NodeJS.ReadableStream).pipe(res);
  } catch (e) { next(e); }
});
