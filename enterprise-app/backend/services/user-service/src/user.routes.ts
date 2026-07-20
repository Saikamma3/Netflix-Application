import { Router } from "express";
import { UserController } from "./user.controller";
import { requireRole } from "./middleware/auth.middleware";
import { UserRole } from "../../shared/types";

export const userRouter = Router();
const ctrl = new UserController();

userRouter.get("/",        requireRole(UserRole.ADMIN),   ctrl.list);
userRouter.get("/me",                                     ctrl.me);
userRouter.get("/:id",                                    ctrl.getById);
userRouter.put("/:id",                                    ctrl.update);
userRouter.delete("/:id",  requireRole(UserRole.ADMIN),   ctrl.remove);
