import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { role } from "../middlewares/role.js";
import {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
} from "../controllers/student.controller.js";
import { getStudentHistory } from "../controllers/student.controller.js";

const router = Router();

// Solo ADMIN puede CRUD alumnos
router.use(auth, role("ADMIN"));

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

router.get("/:id/historial", getStudentHistory);

export default router;
