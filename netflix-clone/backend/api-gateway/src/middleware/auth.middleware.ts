import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../../shared/types";

export function authGuard(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing authorization header" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.headers["x-user-id"]      = payload.sub;
    req.headers["x-user-email"]   = payload.email;
    req.headers["x-profile-id"]   = payload.profileId || "";
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}
