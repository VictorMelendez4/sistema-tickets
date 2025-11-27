// src/pages/PanelDocente.jsx
import { useEffect, useState, useContext } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PanelDocente() {
  const { usuario } = useContext(AuthContext);
  const [docente, setDocente] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingDocente, setLoadingDocente] = useState(true);

  // 1. Cargar información del docente actual
  useEffect(() => {
    async function cargarDocenteActual() {
      try {
        setLoadingDocente(true);
        const { data } = await api.get("/teachers");
        
        // CORRECCIÓN: Comparamos emails ignorando mayúsculas/minúsculas por seguridad
        const docenteEncontrado = data.find(
          (d) => d.emailInst.toLowerCase() === usuario.email.toLowerCase()
        );

        if (docenteEncontrado) {
          setDocente(docenteEncontrado);
        } else {
          console.warn("Docente no encontrado en la lista para:", usuario.email);
        }
      } catch (err) {
        console.error("Error cargando docente:", err);
      } finally {
        setLoadingDocente(false);
      }
    }

    // CORRECCIÓN PRINCIPAL:
    // Validamos si existe usuario y si su rol (convertido a mayúsculas) es "TEACHER"
    if (usuario && usuario.role?.toUpperCase() === "TEACHER") {
      cargarDocenteActual();
    } else {
      setLoadingDocente(false);
    }
  }, [usuario]);

  // 2. Cargar grupos del docente
  useEffect(() => {
    if (!docente) {
      setGrupos([]);
      return;
    }

    async function cargarGruposDocente() {
      setLoadingGrupos(true);
      try {
        const { data } = await api.get(`/groups?teacher=${docente._id}`);
        setGrupos(data);
      } catch (err) {
        console.error("Error cargando grupos:", err);
      } finally {
        setLoadingGrupos(false);
      }
    }

    cargarGruposDocente();
  }, [docente]);

  // --- RENDERIZADO ---

  if (loadingDocente) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!docente) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4 className="alert-heading">⚠️ Perfil no encontrado</h4>
          <p>
            El usuario <strong>{usuario?.email}</strong> tiene rol de Docente, 
            pero no se encontraron sus datos en el sistema.
          </p>
          <hr />
          <p className="mb-0">Tu rol actual es: <strong>{usuario?.role}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header con información del docente */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="mb-1">
                👋 Bienvenido, {docente.firstName} {docente.lastName}
              </h2>
              <p className="text-muted mb-0">
                <span className="badge bg-primary me-2">ID: {docente.employeeId}</span>
                {docente.specialty?.map((s, idx) => (
                  <span key={idx} className="badge bg-secondary me-1">{s}</span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Grupos */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">📚 Mis Grupos ({grupos.length})</h5>
        </div>
        <div className="card-body">
          {loadingGrupos ? (
            <div className="text-center py-4">
              <div className="spinner-border text-sm text-primary" />
            </div>
          ) : grupos.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No tienes grupos asignados.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Grupo</th>
                    <th>Curso</th>
                    <th>Periodo</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.map((g) => (
                    <tr key={g._id}>
                      <td><strong>{g.name}</strong></td>
                      <td>{g.course ? g.course.name : <span className="text-muted">Sin curso</span>}</td>
                      <td>{g.term || "N/A"}</td>
                      <td>
                        <span className={`badge ${g.status === "ACTIVO" ? "bg-success" : "bg-secondary"}`}>
                          {g.status || "ACTIVO"}
                        </span>
                      </td>
                      <td className="text-center">
                        <Link to={`/grupos/${g._id}/reporte`} className="btn btn-sm btn-primary">
                          📊 Reporte
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}