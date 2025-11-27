import { Student } from "../models/Student.js";
import { Inscripcion } from "../models/Inscripcion.js";
import { Calificacion } from "../models/Calificacion.js";
import { Group } from "../models/Group.js";

// === Helper: mismo del reporte de grupos ===
function calcularPromedio(rubros = []) {
  if (!rubros.length) return null;

  let sumaPesos = 0;
  let suma = 0;

  for (const r of rubros) {
    const p = Number(r.porcentaje) || 0;
    const c = Number(r.calificacion);
    if (isNaN(c)) continue;

    sumaPesos += p;
    suma += c * p;
  }

  if (!sumaPesos) return null;
  return Number((suma / sumaPesos).toFixed(2));
}

export async function createStudent(req, res) {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Error creando alumno", error: err.message });
  }
}

export async function getStudents(req, res) {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo alumnos" });
  }
}

export async function getStudent(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: "No encontrado" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
}

export async function updateStudent(req, res) {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ msg: "No encontrado" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ msg: "Error actualizando", error: err.message });
  }
}

export async function deleteStudent(req, res) {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ msg: "No encontrado" });
    res.json({ msg: "Alumno eliminado" });
  } catch (err) {
    res.status(500).json({ msg: "Error eliminando" });
  }
}

export async function getStudentHistory(req, res) {
  const { id } = req.params;

  try {
    // 1) Todas las inscripciones del alumno
    const inscripciones = await Inscripcion.find({ alumno: id })
      .populate({
        path: "grupo",
        populate: [{ path: "course" }, { path: "teacher" }]
      })
      .sort({ createdAt: -1 });

    const inscIds = inscripciones.map((i) => i._id);

    // 2) Calificaciones asociadas
    const califs = await Calificacion.find({
      inscripcion: { $in: inscIds },
    });

    const califMap = new Map();
    for (const c of califs) {
      califMap.set(String(c.inscripcion), c);
    }

    // 3) Construcción del historial
    const historial = inscripciones.map((ins) => {
      const grupo = ins.grupo;
      const curso = grupo?.course;
      const calif = califMap.get(String(ins._id));

      const rubros = calif?.rubros || [];
      const promedio = calcularPromedio(rubros);

      let estado = "SIN_CALIFICAR";
      if (promedio !== null) {
        estado = promedio >= 70 ? "APROBADO" : "REPROBADO";
      }

      return {
        inscripcionId: ins._id,
        curso: curso ? curso.name : "(curso eliminado)",
        docente: grupo?.teacher
          ? `${grupo.teacher.firstName} ${grupo.teacher.lastName}`
          : "(sin docente)",
        grupo: grupo?.name,
        periodo: grupo?.term || "-",
        rubros,
        promedio,
        estado,
      };
    });

    res.json(historial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error generando historial del alumno" });
  }
}
