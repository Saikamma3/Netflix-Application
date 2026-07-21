import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

const svc = new AuthService();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterInput(email: string, password: string): string | null {
  if (!email || !password)           return "email and password required";
  if (!EMAIL_RE.test(email))         return "Invalid email format";
  if (email.length > 254)            return "Email too long";
  if (password.length < 8)           return "Password must be at least 8 characters";
  if (password.length > 128)         return "Password too long";
  if (!/[A-Z]/.test(password))       return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password))       return "Password must contain a lowercase letter";
  if (!/[0-9!@#$%^&*]/.test(password)) return "Password must contain a number or special character";
  return null;
}

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const err = validateRegisterInput(email, password);
      if (err) { res.status(400).json({ success: false, error: err }); return; }
      const data = await svc.register(email.toLowerCase().trim(), password);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) { res.status(400).json({ success: false, error: "email and password required" }); return; }
      if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ success: false, error: "Invalid input" }); return;
      }
      const data = await svc.login(email.toLowerCase().trim(), password);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || typeof refreshToken !== "string") {
        res.status(400).json({ success: false, error: "refreshToken required" }); return;
      }
      const data = await svc.refresh(refreshToken);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (userId) await svc.logout(userId);
      res.json({ success: true });
    } catch (e) { next(e); }
  };

  selectProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId    = req.headers["x-user-id"] as string;
      const { profileId } = req.body;
      if (!userId || !profileId) { res.status(400).json({ success: false, error: "profileId required" }); return; }
      if (typeof profileId !== "string") { res.status(400).json({ success: false, error: "Invalid profileId" }); return; }
      const data = await svc.selectProfile(userId, profileId);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };
}
