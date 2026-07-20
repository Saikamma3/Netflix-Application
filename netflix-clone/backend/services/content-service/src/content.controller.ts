import { Request, Response, NextFunction } from "express";
import { ContentService } from "./content.service";

const svc = new ContentService();

export class ContentController {
  featured = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: await svc.getFeatured() });
    } catch (e) { next(e); }
  };

  genres = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: await svc.getGenres() });
    } catch (e) { next(e); }
  };

  byGenre = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page     = Math.max(1, Number(req.query.page)     || 1);
      const pageSize = Math.min(50, Number(req.query.pageSize) || 20);
      const result   = await svc.getByGenre(req.params.slug, page, pageSize);
      res.json({
        success: true,
        data: result.items,
        pagination: { page, pageSize, total: result.total, totalPages: Math.ceil(result.total / pageSize) },
      });
    } catch (e) { next(e); }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string) || "";
      res.json({ success: true, data: await svc.search(q) });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ success: true, data: await svc.getById(req.params.id) });
    } catch (e) { next(e); }
  };

  episodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const season = req.query.season ? Number(req.query.season) : undefined;
      res.json({ success: true, data: await svc.getEpisodes(req.params.id, season) });
    } catch (e) { next(e); }
  };
}
