import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    logger.http({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      userId: req.headers["x-user-id"],
      correlationId: req.headers["x-correlation-id"],
    });
  });
  next();
}
