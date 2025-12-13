import { Router } from "express";
import { 
    getAllUsers, 
    updateUserRole, 
    deleteUser, 
    createStaff,     
    getStaffMetrics,
    getMyStats,
    getSupportAgents // 👈 1. IMPORTAMOS LA NUEVA FUNCIÓN
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Protegemos todas las rutas (requiere login)
router.use(protect);

// === ZONA ABIERTA PARA STAFF (Soporte y Admin) ===

// Estadísticas Personales (Perfil)
router.get("/profile/stats", getMyStats); 

// 👇 CORRECCIÓN 403: Métricas Globales (Permitimos a SUPPORT)
router.get("/staff/metrics", authorize("ADMIN", "SUPPORT"), getStaffMetrics);

// 👇 CORRECCIÓN 404: Lista de Agentes (Para el dropdown de reasignar)
router.get("/staff/agents", authorize("ADMIN", "SUPPORT"), getSupportAgents);


// === ZONA DE ALTA SEGURIDAD (SOLO ADMIN) ===
router.use(authorize("ADMIN"));

router.route("/")
    .get(getAllUsers)   
    .post(createStaff); 

router.route("/:id")
    .put(updateUserRole)
    .delete(deleteUser);

export default router;