import { Course } from "../models/Course.js";

export async function createCourse(req, res) {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ msg: "Error creando curso", error: err.message });
  }
}

export async function getCourses(req, res) {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo cursos" });
  }
}

export async function getCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
}

export async function updateCourse(req, res) {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });
    res.json(course);
  } catch (err) {
    res.status(400).json({ msg: "Error actualizando", error: err.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ msg: "Curso no encontrado" });
    res.json({ msg: "Curso eliminado" });
  } catch (err) {
    res.status(500).json({ msg: "Error eliminando curso" });
  }
}
