import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { role } from "../middlewares/role.js";

import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse
} from "../controllers/course.controller.js";

const router = Router();

// Solo ADMIN puede manejar materias
router.use(auth, role("ADMIN"));

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
