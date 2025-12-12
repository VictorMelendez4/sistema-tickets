import { Router } from "express";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas protegidas para gestión de usuarios
router.get("/", protect, getAllUsers);
router.put("/:id", protect, updateUserRole);
router.delete("/:id", protect, deleteUser);

export default router;