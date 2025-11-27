import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { role } from "../middlewares/role.js";
import {
  createTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher
} from "../controllers/teacher.controller.js";

const router = Router();

// 1. Todos los usuarios deben estar logueados para entrar aquí
router.use(auth);

// 2. Rutas de LECTURA (GET):
// Permitimos que ADMIN y TEACHER vean la información.
// (El teacher necesita esto para encontrar su propio perfil)
router.get("/", role("ADMIN", "TEACHER"), getTeachers);
router.get("/:id", role("ADMIN", "TEACHER"), getTeacher);

// 3. Rutas de ESCRITURA (POST, PUT, DELETE):
// Solo el ADMIN puede crear, modificar o borrar docentes.
router.post("/", role("ADMIN"), createTeacher);
router.put("/:id", role("ADMIN"), updateTeacher);
router.delete("/:id", role("ADMIN"), deleteTeacher);

export default router;