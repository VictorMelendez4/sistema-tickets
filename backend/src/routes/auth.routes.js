import { Router } from "express";
import { register, login, logout, createStaff, getSupportAgents, updatePassword } from "../controllers/auth.controller.js";
// Update the import to match the new middleware
import { protect, authorize } from "../middlewares/auth.middleware.js"; 

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/agents", protect, getSupportAgents);
router.post("/create-staff", protect, authorize("ADMIN"), createStaff);
router.put("/update-password", protect, updatePassword);

export default router;