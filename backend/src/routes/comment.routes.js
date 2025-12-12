import { Router } from "express";
import { addComment } from "../controllers/comment.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// POST /api/comments
router.post("/", protect, addComment);

export default router;
