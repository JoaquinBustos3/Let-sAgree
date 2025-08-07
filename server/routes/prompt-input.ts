import { Router } from "express";
import promptInputController from "../controllers/prompt-input-controller";

const router = Router();

// Accept category as a path variable
router.post("/:category", promptInputController.receivePromptInput);

export default router;
