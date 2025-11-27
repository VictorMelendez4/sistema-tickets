import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { role } from "../middlewares/role.js";
import {
  crearInscripcion,
  obtenerInscripciones,
  obtenerInscripcion,
  actualizarInscripcion,
  eliminarInscripcion
} from "../controllers/inscripcion.controller.js";

const router = Router();

// Solo ADMIN maneja inscripciones (por ahora)
router.use(auth, role("ADMIN"));

router.post("/", crearInscripcion);
router.get("/", obtenerInscripciones);
router.get("/:id", obtenerInscripcion);
router.put("/:id", actualizarInscripcion);
router.delete("/:id", eliminarInscripcion);

export default router;
