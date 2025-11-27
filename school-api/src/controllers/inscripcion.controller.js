import { Inscripcion } from "../models/Inscripcion.js";

export async function crearInscripcion(req, res) {
  try {
    const { alumno, grupo } = req.body;

    if (!alumno || !grupo) {
      return res.status(400).json({ msg: "Falta alumno o grupo" });
    }

    const inscripcion = await Inscripcion.create(req.body);
    res.status(201).json(inscripcion);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ msg: "El alumno ya está inscrito en ese grupo" });
    }
    res
      .status(400)
      .json({ msg: "Error creando inscripción", error: err.message });
  }
}

export async function obtenerInscripciones(req, res) {
  try {
    const { grupo, alumno } = req.query;

    const filtro = {};
    if (grupo) filtro.grupo = grupo;
    if (alumno) filtro.alumno = alumno;

    const inscripciones = await Inscripcion.find(filtro)
      .populate("alumno")
      .populate({
        path: "grupo",
        populate: [{ path: "course" }, { path: "teacher" }]
      })
      .sort({ createdAt: -1 });

    res.json(inscripciones);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo inscripciones" });
  }
}

export async function obtenerInscripcion(req, res) {
  try {
    const inscripcion = await Inscripcion.findById(req.params.id)
      .populate("alumno")
      .populate({
        path: "grupo",
        populate: [{ path: "course" }, { path: "teacher" }]
      });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    res.json(inscripcion);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
}

export async function actualizarInscripcion(req, res) {
  try {
    const inscripcion = await Inscripcion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("alumno")
      .populate({
        path: "grupo",
        populate: [{ path: "course" }, { path: "teacher" }]
      });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    res.json(inscripcion);
  } catch (err) {
    res.status(400).json({
      msg: "Error actualizando inscripción",
      error: err.message
    });
  }
}

export async function eliminarInscripcion(req, res) {
  try {
    const inscripcion = await Inscripcion.findByIdAndDelete(req.params.id);
    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }
    res.json({ msg: "Inscripción eliminada" });
  } catch (err) {
    res.status(500).json({ msg: "Error eliminando inscripción" });
  }
}
