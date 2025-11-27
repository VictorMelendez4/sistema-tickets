// src/routes/auth.routes.js
import { Router } from "express";
import {
  login,
  registerAdmin,
  registerTeacher,
} from "../controllers/auth.controller.js";

const router = Router();

// Login
router.post("/login", login);

// Registrar admin (solo para seed inicial, luego puedes no usarla)
router.post("/register-admin", registerAdmin);

// Registrar docente
router.post("/register-teacher", registerTeacher);

export default router;
