import { Router } from "express";
import {
  register,
  login,
  getSupportAgents,
  createStaff 
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Rutas Públicas
router.post("/login", login);
router.post("/register", register);

// Rutas Protegidas (Requieren Token)
router.get("/support-agents", auth, getSupportAgents);
router.post("/create-staff", auth, createStaff); 

export default router;