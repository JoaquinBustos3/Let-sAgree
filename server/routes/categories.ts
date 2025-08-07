import { Router } from "express";
import categoriesMiddleware from "../middleware/categories-middleware";
import categoriesController from "../controllers/categories-controller";

const router = Router();

router.get("/", categoriesMiddleware, categoriesController.getCategories);

export default router;
