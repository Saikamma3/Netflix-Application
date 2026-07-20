import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const code = err.statusCode || 500;
  res.status(code).json({
    success: false,
    error: code >= 500 ? "Internal server error" : err.message,
  });
}
