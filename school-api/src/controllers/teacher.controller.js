import { Teacher } from "../models/Teacher.js";

export async function createTeacher(req, res) {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ msg: "Error creando docente", error: err.message });
  }
}

export async function getTeachers(req, res) {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo docentes" });
  }
}

export async function getTeacher(req, res) {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ msg: "Docente no encontrado" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
}

export async function updateTeacher(req, res) {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!teacher) return res.status(404).json({ msg: "Docente no encontrado" });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ msg: "Error actualizando", error: err.message });
  }
}

export async function deleteTeacher(req, res) {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ msg: "Docente no encontrado" });
    res.json({ msg: "Docente eliminado" });
  } catch (err) {
    res.status(500).json({ msg: "Error eliminando docente" });
  }
}
