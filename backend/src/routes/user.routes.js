import { Router } from "express";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Rutas protegidas para gestión de usuarios
router.get("/", auth, getAllUsers);
router.put("/:id", auth, updateUserRole);
router.delete("/:id", auth, deleteUser);

export default router;