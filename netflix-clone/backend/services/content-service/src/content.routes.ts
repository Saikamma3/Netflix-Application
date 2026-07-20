import { Router } from "express";
import { ContentController } from "./content.controller";

export const contentRouter = Router();
const ctrl = new ContentController();

contentRouter.get("/featured",     ctrl.featured);
contentRouter.get("/genres",       ctrl.genres);
contentRouter.get("/by-genre/:slug", ctrl.byGenre);
contentRouter.get("/search",       ctrl.search);
contentRouter.get("/:id",          ctrl.getById);
contentRouter.get("/:id/episodes", ctrl.episodes);
