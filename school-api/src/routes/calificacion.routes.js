import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { role } from "../middlewares/role.js";
import { 
  saveCalificacion, 
  getCalificaciones, 
  deleteCalificacion 
} from "../controllers/calificacion.controller.js";

const router = Router();

router.use(auth);

// Ruta para GUARDAR (sirve para crear y actualizar)
router.post("/", role("ADMIN", "TEACHER"), saveCalificacion);

// Rutas extra por si las necesitas en el futuro
router.get("/", role("ADMIN", "TEACHER"), getCalificaciones);
router.delete("/:id", role("ADMIN"), deleteCalificacion);

export default router;