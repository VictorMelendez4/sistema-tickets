import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";

export default function ReporteGrupo() {
  const { id } = useParams(); // ID del grupo
  const [grupo, setGrupo] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // === 1. CONFIGURACIÓN DE RUBROS ===
  // Aquí defines qué columnas quieres calificar y cuánto valen.
  const rubrosDefault = [
    { name: "Parcial 1", porcentaje: 30 },
    { name: "Parcial 2", porcentaje: 30 },
    { name: "Proyecto", porcentaje: 40 },
  ];

  // === 2. CARGAR DATOS ===
  useEffect(() => {
    async function cargarDatos() {
      try {
        // Pedimos datos al backend
        const { data } = await api.get(`/groups/${id}/reporte`);
        setGrupo(data.grupo);

        // Preparamos los datos para que tengan casillas vacías si no hay nota
        const alumnosFormateados = data.alumnos.map((a) => {
          let rubrosActuales = rubrosDefault.map((def) => {
            // Buscamos si el alumno ya tiene nota guardada en este rubro
            const encontrado = a.rubros.find((r) => r.name === def.name);
            return {
              name: def.name,
              porcentaje: def.porcentaje,
              calificacion: encontrado ? encontrado.calificacion : "", // Si hay nota la pone, si no, vacío
            };
          });

          return {
            ...a,
            rubros: rubrosActuales,
            loadingGuardar: false, 
          };
        });

        setAlumnos(alumnosFormateados);
      } catch (err) {
        console.error("Error cargando reporte:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [id]);

  // === 3. MANEJAR ESCRITURA EN LOS INPUTS ===
  const handleCalificacionChange = (indexAlumno, indexRubro, valor) => {
    const nuevosAlumnos = [...alumnos];
    nuevosAlumnos[indexAlumno].rubros[indexRubro].calificacion = valor;
    
    // Calcular promedio "en vivo" para que el usuario vea cómo va quedando
    const rubros = nuevosAlumnos[indexAlumno].rubros;
    let suma = 0;
    
    rubros.forEach(r => {
      const cal = parseFloat(r.calificacion) || 0;
      suma += cal * (r.porcentaje / 100);
    });
    
    nuevosAlumnos[indexAlumno].promedio = suma.toFixed(1);
    setAlumnos(nuevosAlumnos);
  };

  // === 4. GUARDAR EN BACKEND ===
  const guardarCalificacion = async (alumno, index) => {
    try {
      // Activar spinner de carga solo en este botón
      const nuevosAlumnos = [...alumnos];
      nuevosAlumnos[index].loadingGuardar = true;
      setAlumnos(nuevosAlumnos);

      // Enviamos al servidor
      await api.post("/calificaciones", {
        inscripcion: alumno.inscripcionId,
        rubros: alumno.rubros,
      });

      alert(`✅ Calificaciones de ${alumno.student.firstName} guardadas.`);
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar. Verifica tu conexión.");
    } finally {
      const nuevosAlumnos = [...alumnos];
      nuevosAlumnos[index].loadingGuardar = false;
      setAlumnos(nuevosAlumnos);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-primary">{grupo?.name}</h2>
          <p className="text-muted mb-0">
            {grupo?.course?.name} | {grupo?.term}
          </p>
        </div>
        <Link to="/panel-docente" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i> Volver al Panel
        </Link>
      </div>

      {/* Tarjeta de Calificaciones */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold">📋 Boleta de Calificaciones</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "30%" }}>Alumno</th>
                  {/* Generar columnas dinámicas según los rubros */}
                  {rubrosDefault.map((rubro, idx) => (
                    <th key={idx} className="text-center" style={{ width: "15%" }}>
                      {rubro.name} <br />
                      <span className="badge bg-light text-dark border">
                        {rubro.porcentaje}%
                      </span>
                    </th>
                  ))}
                  <th className="text-center table-active">Promedio</th>
                  <th className="text-center">Guardar</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan={rubrosDefault.length + 3} className="text-center py-5 text-muted">
                      <i className="bi bi-info-circle me-2"></i>
                      No hay alumnos inscritos en este grupo.
                    </td>
                  </tr>
                ) : (
                  alumnos.map((alumno, idx) => (
                    <tr key={alumno.inscripcionId}>
                      {/* Datos del Alumno */}
                      <td>
                        <div className="fw-bold text-dark">
                          {alumno.student.lastName}, {alumno.student.firstName}
                        </div>
                        <small className="text-muted">{alumno.student.emailAcad}</small>
                      </td>

                      {/* INPUTS DE CALIFICACIÓN (AQUÍ ESTÁ LA MAGIA ✨) */}
                      {alumno.rubros.map((rubro, idxRubro) => (
                        <td key={idxRubro} className="text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control text-center mx-auto"
                            placeholder="-"
                            style={{ maxWidth: "80px", fontWeight: "bold" }}
                            value={rubro.calificacion}
                            onChange={(e) =>
                              handleCalificacionChange(idx, idxRubro, e.target.value)
                            }
                          />
                        </td>
                      ))}

                      {/* Promedio Calculado */}
                      <td className="text-center table-active fw-bold fs-5">
                         {/* Color condicional: Rojo si reprueba, Verde si aprueba */}
                        <span className={parseFloat(alumno.promedio) < 70 ? "text-danger" : "text-success"}>
                          {alumno.promedio || "-"}
                        </span>
                      </td>

                      {/* Botón Guardar Individual */}
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-primary px-3"
                          onClick={() => guardarCalificacion(alumno, idx)}
                          disabled={alumno.loadingGuardar}
                          title="Guardar calificación de este alumno"
                        >
                          {alumno.loadingGuardar ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <i className="bi bi-save"></i>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}