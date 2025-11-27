import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";

export default function HistorialAlumno() {
  const { id } = useParams();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const { data } = await api.get(`/students/${id}/historial`);
        setHistorial(data);
      } catch (err) {
        console.error(err);
        alert("Error cargando historial");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [id]);

  if (loading) return <p className="p-3">Cargando historial...</p>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Historial académico del alumno</h2>
        <Link to="/alumnos" className="btn btn-secondary btn-sm">
          ← Volver a alumnos
        </Link>
      </div>

      <table className="table table-sm">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Grupo</th>
            <th>Docente</th>
            <th>Periodo</th>
            <th>Promedio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((h) => (
            <tr key={h.inscripcionId}>
              <td>{h.curso}</td>
              <td>{h.grupo}</td>
              <td>{h.docente}</td>
              <td>{h.periodo}</td>
              <td>{h.promedio ?? "-"}</td>
              <td>
                {h.estado === "APROBADO" && (
                  <span className="badge bg-success">Aprobado</span>
                )}
                {h.estado === "REPROBADO" && (
                  <span className="badge bg-danger">Reprobado</span>
                )}
                {h.estado === "SIN_CALIFICAR" && (
                  <span className="badge bg-secondary">Sin calificar</span>
                )}
              </td>
            </tr>
          ))}

          {historial.length === 0 && (
            <tr>
              <td colSpan="6" className="text-muted">
                No hay inscripciones registradas para este alumno.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
