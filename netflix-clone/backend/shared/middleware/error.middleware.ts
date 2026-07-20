import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const code = err.statusCode || 500;
  console.error(`[${req.method}] ${req.path} → ${code}:`, err.message);
  res.status(code).json({
    success: false,
    error: code >= 500 ? "Internal server error" : err.message,
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, error: "Route not found" });
}
