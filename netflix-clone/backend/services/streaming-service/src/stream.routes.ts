import { Router, Request, Response, NextFunction } from "express";
import { getObject } from "./minio";

export const streamRouter = Router();

/**
 * GET /stream/:contentId/manifest.m3u8
 * Proxies the HLS manifest from MinIO so the client never has a direct
 * MinIO URL — all access is authenticated through the API Gateway.
 *
 * The videoKey stored in the DB is the MinIO object key, e.g.
 *   movies/big-buck-bunny/manifest.m3u8
 * The client calls /stream/<contentId>/manifest.m3u8
 * and this service resolves the key from the DB (or from the path for simplicity).
 */
streamRouter.get("/:key(*)/manifest.m3u8", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key    = `${req.params.key}/manifest.m3u8`;
    const stream = await getObject(key);
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-cache");
    (stream as NodeJS.ReadableStream).pipe(res);
  } catch (e) { next(e); }
});

// Serve HLS segments (.ts files)
streamRouter.get("/:key(*).ts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key    = `${req.params.key}.ts`;
    const stream = await getObject(key);
    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    (stream as NodeJS.ReadableStream).pipe(res);
  } catch (e) { next(e); }
});

// Serve fMP4 segments (.m4s files — DASH/fMP4 HLS)
streamRouter.get("/:key(*).m4s", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key    = `${req.params.key}.m4s`;
    const stream = await getObject(key);
    res.setHeader("Content-Type", "video/iso.segment");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    (stream as NodeJS.ReadableStream).pipe(res);
  } catch (e) { next(e); }
});
