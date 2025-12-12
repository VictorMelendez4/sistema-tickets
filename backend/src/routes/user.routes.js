import { Router } from "express";
import { 
    getAllUsers, 
    updateUserRole, 
    deleteUser, 
    createStaff,     // 👈 Nueva
    getStaffMetrics  // 👈 Nueva
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Todo requiere ser ADMIN
router.use(protect);
router.use(authorize("ADMIN"));

// 1. Ruta de Métricas (¡SIEMPRE ANTES DEL ID!)
router.get("/staff/metrics", getStaffMetrics);

// 2. Rutas Generales
router.route("/")
    .get(getAllUsers)
    .post(createStaff);

// 3. Rutas por ID
router.route("/:id")
    .put(updateUserRole)
    .delete(deleteUser);

export default router;