import { Router } from "express";
import { addComment } from "../controllers/comment.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// POST /api/comments
router.post("/", auth, addComment);

export default router;
