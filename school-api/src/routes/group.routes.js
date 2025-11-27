import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { role } from "../middlewares/role.js";
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  getGroupReport // Asegúrate de tener esta importación si usas reportes
} from "../controllers/group.controller.js";

const router = Router();

router.use(auth);

// === CAMBIO AQUÍ ===
// Permitimos que ADMIN y TEACHER vean grupos
// (El teacher necesita esto para ver SUS grupos en el panel)
router.get("/", role("ADMIN", "TEACHER"), getGroups);
router.get("/:id", role("ADMIN", "TEACHER"), getGroup);

// Reporte de grupo (También permitido para docentes)
router.get("/:id/reporte", role("ADMIN", "TEACHER"), getGroupReport);

// Crear, Editar, Borrar SOLO ADMIN
router.post("/", role("ADMIN"), createGroup);
router.put("/:id", role("ADMIN"), updateGroup);
router.delete("/:id", role("ADMIN"), deleteGroup);

export default router;