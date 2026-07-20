import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  logger.error({ message: err.message, path: req.path, statusCode });

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? "Internal server error" : err.message,
  });
}
