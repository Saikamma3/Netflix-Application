import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../../shared/types";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.headers["x-user-role"] as UserRole;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
