import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = req.headers["x-correlation-id"] as string;
  const statusCode = err.statusCode || 500;

  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    correlationId,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? "Internal server error" : err.message,
    code: err.code,
    correlationId,
  });
}
