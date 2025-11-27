import { Calificacion } from "../models/Calificacion.js";

// ==========================================
// HELPER: Calcular calificación final
// ==========================================
function calcularCalificacionFinal(rubros) {
  // 1. Validar que vengan rubros
  if (!rubros || !Array.isArray(rubros) || rubros.length === 0) {
    return { valor: 0 }; // Si no hay rubros, la final es 0
  }

  // 2. Sumar porcentajes
  const sumaPorcentajes = rubros.reduce(
    (acc, r) => acc + (Number(r.porcentaje) || 0),
    0
  );

  // Opcional: Si quieres ser estricto con el 100%, descomenta esto:
  /*
  if (sumaPorcentajes !== 100) {
    return { error: "La suma de los porcentajes debe ser exactamente 100" };
  }
  */

  // 3. Calcular promedio ponderado
  const final = rubros.reduce(
    (acc, r) => acc + (Number(r.calificacion || 0) * Number(r.porcentaje || 0)) / 100,
    0
  );

  // Redondear a 1 decimal
  return { valor: Number(final.toFixed(1)) };
}

// ==========================================
// FUNCIÓN PRINCIPAL: Guardar (Crear o Actualizar)
// ==========================================
export async function saveCalificacion(req, res) {
  try {
    const { inscripcion, rubros } = req.body;

    // 1. Calculamos la calificación final aquí en el backend
    const resultado = calcularCalificacionFinal(rubros);
    
    if (resultado.error) {
      return res.status(400).json({ msg: resultado.error });
    }

    // 2. Buscamos y actualizamos (o creamos si no existe)
    const calificacion = await Calificacion.findOneAndUpdate(
      { inscripcion: inscripcion },
      { 
        inscripcion, 
        rubros,
        calificacionFinal: resultado.valor // Guardamos el promedio calculado
      },
      { new: true, upsert: true } // upsert: true crea si no existe
    );

    res.json(calificacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error guardando calificación", error: err.message });
  }
}

// ==========================================
// OTRAS FUNCIONES (Lectura y eliminación)
// ==========================================
export async function getCalificaciones(req, res) {
  try {
    const calificaciones = await Calificacion.find().populate("inscripcion");
    res.json(calificaciones);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo calificaciones" });
  }
}

export async function deleteCalificacion(req, res) {
    try {
      const calificacion = await Calificacion.findByIdAndDelete(req.params.id);
      if (!calificacion) {
        return res.status(404).json({ msg: "Calificación no encontrada" });
      }
      res.json({ msg: "Calificación eliminada" });
    } catch (err) {
      res.status(500).json({ msg: "Error eliminando calificación" });
    }
  }