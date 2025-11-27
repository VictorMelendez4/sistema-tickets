// src/controllers/group.controller.js
import { Group } from "../models/Group.js";
import { Inscripcion } from "../models/Inscripcion.js";    // ajusta el path si es distinto
import { Calificacion } from "../models/Calificacion.js";  // ajusta el path si es distinto

// =============================
// Helper para promedio dinámico
// =============================
function calcularPromedio(rubros = []) {
  if (!rubros.length) return null;

  let sumaPesos = 0;
  let suma = 0;

  for (const r of rubros) {
    const porcentaje = Number(r.porcentaje) || 0;
    const calificacion = Number(r.calificacion);
    if (isNaN(calificacion)) continue;

    sumaPesos += porcentaje;
    suma += calificacion * porcentaje;
  }

  if (!sumaPesos) return null;

  return Number((suma / sumaPesos).toFixed(2));
}

// =============================
// CRUD de grupos
// =============================

export async function createGroup(req, res) {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ msg: "Error creando grupo", error: err.message });
  }
}

export async function getGroups(req, res) {
  try {
    const { teacher } = req.query;

    const filtro = {};
    if (teacher) {
      filtro.teacher = teacher; // solo grupos de ese docente
    }

    const groups = await Group.find(filtro)
      .populate("course")
      .populate("teacher")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo grupos" });
  }
}


export async function getGroup(req, res) {
  try {
    const group = await Group.findById(req.params.id)
      .populate("course")
      .populate("teacher");

    if (!group) return res.status(404).json({ msg: "Grupo no encontrado" });

    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
}

export async function updateGroup(req, res) {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("course")
      .populate("teacher");

    if (!group) return res.status(404).json({ msg: "Grupo no encontrado" });

    res.json(group);
  } catch (err) {
    res.status(400).json({
      msg: "Error actualizando grupo",
      error: err.message,
    });
  }
}

export async function deleteGroup(req, res) {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ msg: "Grupo no encontrado" });

    res.json({ msg: "Grupo eliminado" });
  } catch (err) {
    res.status(500).json({ msg: "Error eliminando grupo" });
  }
}

// =============================
//  REPORTE POR GRUPO
// =============================

export async function getGroupReport(req, res) {
  const { id } = req.params; // id del grupo

  try {
    // 1) Datos del grupo
    const grupo = await Group.findById(id)
      .populate("course")
      .populate("teacher");

    if (!grupo) {
      return res.status(404).json({ msg: "Grupo no encontrado" });
    }

    // 2) Inscripciones del grupo (usa tus campos "grupo" y "alumno")
    const inscripciones = await Inscripcion.find({ grupo: id }).populate(
      "alumno"
    );

    const inscIds = inscripciones.map((i) => i._id);

    // 3) Calificaciones de esas inscripciones
    const califs = await Calificacion.find({
      inscripcion: { $in: inscIds },
    });

    const califPorInscripcion = new Map();
    for (const c of califs) {
      califPorInscripcion.set(String(c.inscripcion), c);
    }

    // 4) Construir arreglo de alumnos con rubros + promedio + estado
    const alumnos = inscripciones.map((ins) => {
      const calif = califPorInscripcion.get(String(ins._id));
      const rubros = calif?.rubros || [];
      const promedio = calcularPromedio(rubros);

      let estado = "SIN_CALIFICAR";
      if (promedio !== null) {
        estado = promedio >= 70 ? "APROBADO" : "REPROBADO";
      }

      const a = ins.alumno;

      return {
        inscripcionId: ins._id,
        student: {
          _id: a._id,
          firstName: a.firstName,
          lastName: a.lastName,
          curpOrId: a.curpOrId,
          emailAcad: a.emailAcad,
        },
        rubros,
        promedio,
        estado,
      };
    });

    res.json({ grupo, alumnos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error generando reporte de grupo" });
  }
}
