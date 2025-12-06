import express from "express";
import { addComment } from "../controllers/comment.controller.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, addComment);

export default router;
