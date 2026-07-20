import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../shared/types";

export function authGuard(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing or malformed Authorization header" });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    // Forward user identity to downstream services
    req.headers["x-user-id"] = payload.sub;
    req.headers["x-user-email"] = payload.email;
    req.headers["x-user-role"] = payload.role;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}
