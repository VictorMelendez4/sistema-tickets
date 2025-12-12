import { Router } from "express";
import { 
    getAllUsers, 
    updateUserRole, 
    deleteUser, 
    createStaff,     
    getStaffMetrics,
    getMyStats  
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Todo requiere ser ADMIN
router.use(protect);
router.get("/profile/stats", getMyStats);
router.use(authorize("ADMIN"));

// 1. Ruta de Métricas (¡SIEMPRE ANTES DEL ID!)
router.get("/staff/metrics", authorize("ADMIN", "SUPPORT"), getStaffMetrics);

// 2. Rutas Generales
router.route("/")
    .get(getAllUsers)
    .post(createStaff);

// 3. Rutas por ID
router.route("/:id")
    .put(updateUserRole)
    .delete(deleteUser);

export default router;