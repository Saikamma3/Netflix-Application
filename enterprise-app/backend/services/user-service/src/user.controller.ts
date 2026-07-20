import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

const userService = new UserService();

export class UserController {
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const user = await userService.findById(userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.findById(req.params.id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page     = Math.max(1, Number(req.query.page)     || 1);
      const pageSize = Math.min(100, Number(req.query.pageSize) || 20);
      const { users, total } = await userService.findAll(page, pageSize);

      res.json({
        success: true,
        data: users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestingUserId = req.headers["x-user-id"] as string;
      const requestingRole   = req.headers["x-user-role"] as string;
      const targetId         = req.params.id;

      // Users can only update their own profile unless they are admins
      if (requestingUserId !== targetId && requestingRole !== "ADMIN") {
        res.status(403).json({ success: false, error: "Forbidden" });
        return;
      }

      const user = await userService.update(targetId, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await userService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
