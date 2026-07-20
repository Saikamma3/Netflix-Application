import { Router } from "express";
import { AuthController } from "./auth.controller";

export const authRouter = Router();
const ctrl = new AuthController();

authRouter.post("/register", ctrl.register);
authRouter.post("/login",    ctrl.login);
authRouter.post("/refresh",  ctrl.refresh);
authRouter.post("/logout",   ctrl.logout);
// Select active profile and get new tokens that embed profileId
authRouter.post("/select-profile", ctrl.selectProfile);
