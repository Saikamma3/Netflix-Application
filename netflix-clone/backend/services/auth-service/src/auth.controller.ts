import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

const svc = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) { res.status(400).json({ success: false, error: "email and password required" }); return; }
      const data = await svc.register(email, password);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) { res.status(400).json({ success: false, error: "email and password required" }); return; }
      const data = await svc.login(email, password);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) { res.status(400).json({ success: false, error: "refreshToken required" }); return; }
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
      const data = await svc.selectProfile(userId, profileId);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };
}
