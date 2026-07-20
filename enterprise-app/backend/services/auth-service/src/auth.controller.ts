import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ success: false, error: "email, password, firstName, lastName are required" });
        return;
      }

      const tokens = await authService.register(email, password, firstName, lastName);
      res.status(201).json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: "email and password are required" });
        return;
      }

      const tokens = await authService.login(email, password);
      res.json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: "refreshToken is required" });
        return;
      }

      const tokens = await authService.refresh(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        res.status(400).json({ success: false, error: "x-user-id header required" });
        return;
      }

      await authService.logout(userId);
      res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  };
}
