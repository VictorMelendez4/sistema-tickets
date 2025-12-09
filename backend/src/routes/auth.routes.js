import { Router } from "express";
import {
  register,
  login,
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/support-agents", auth, getSupportAgents);
// Si luego quieres un /profile, lo implementamos bien en el controlador;
// por ahora lo quitamos porque no existe y truena.

export default router;
