import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    avgRating: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtenemos todos los tickets para calcular métricas locales
        // (En un sistema gigante, esto lo haría el backend, pero aquí está bien)
        const { data } = await api.get("/tickets");
        
        // 1. Total Tickets
        const total = data.length;
        
        // 2. Tickets Abiertos/En Proceso
        const open = data.filter(t => t.status === "ABIERTO" || t.status === "EN_PROCESO").length;
        
        // 3. Calcular Promedio de Estrellas
        const ratedTickets = data.filter(t => t.rating > 0); // Solo los que tienen votos
        const sumRatings = ratedTickets.reduce((sum, t) => sum + t.rating, 0);
        const avg = ratedTickets.length > 0 ? (sumRatings / ratedTickets.length).toFixed(1) : 0;

        setStats({
          total,
          open,
          avgRating: avg,
          totalRatings: ratedTickets.length
        });
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-5 text-center">Cargando métricas...</div>;

  return (
    <div className="container-fluid" style={{ maxWidth: "1000px" }}>
      <h2 className="fw-bold mb-4">Hola, {user.firstName} 👋</h2>

      {/* TARJETAS DE RESUMEN */}
      <div className="row g-4 mb-5">
        
        {/* TARJETA 1: PENDIENTES */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Tickets Activos</h6>
              <div className="d-flex align-items-center justify-content-between mt-3">
                <h2 className="display-4 fw-bold mb-0 text-primary">{stats.open}</h2>
                <i className="bi bi-hourglass-split fs-1 text-primary opacity-25"></i>
              </div>
              <small className="text-muted">Necesitan atención</small>
            </div>
          </div>
        </div>

        {/* TARJETA 2: CALIDAD (AQUÍ SE USA LA CALIFICACIÓN) */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Calidad del Servicio</h6>
              <div className="d-flex align-items-center justify-content-between mt-3">
                <div className="d-flex align-items-end">
                    <h2 className="display-4 fw-bold mb-0 text-dark">{stats.avgRating}</h2>
                    <span className="fs-5 text-warning ms-1 mb-2">★</span>
                </div>
                <i className="bi bi-award fs-1 text-warning opacity-25"></i>
              </div>
              <small className="text-muted">Basado en {stats.totalRatings} opiniones</small>
            </div>
          </div>
        </div>

        {/* TARJETA 3: TOTAL HISTÓRICO */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Total Histórico</h6>
              <div className="d-flex align-items-center justify-content-between mt-3">
                <h2 className="display-4 fw-bold mb-0 text-success">{stats.total}</h2>
                <i className="bi bi-folder-check fs-1 text-success opacity-25"></i>
              </div>
              <small className="text-muted">Tickets registrados</small>
            </div>
          </div>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <h5 className="fw-bold mb-3">¿Qué quieres hacer hoy?</h5>
      <div className="row">
        <div className="col-md-6 mb-3">
            {user.role === "CLIENT" ? (
                <Link to="/nuevo-ticket" className="btn btn-primary w-100 py-3 fw-bold shadow-sm">
                    <i className="bi bi-plus-circle me-2"></i> Crear Nuevo Reporte
                </Link>
            ) : (
                <Link to="/bandeja-entrada" className="btn btn-primary w-100 py-3 fw-bold shadow-sm">
                    <i className="bi bi-inbox me-2"></i> Ir a Bandeja de Entrada
                </Link>
            )}
        </div>
        <div className="col-md-6 mb-3">
             <Link to={user.role === "CLIENT" ? "/mis-tickets" : "/mis-casos"} className="btn btn-light w-100 py-3 fw-bold border shadow-sm">
                <i className="bi bi-list-ul me-2"></i> Ver Mis Listados
            </Link>
        </div>
      </div>

    </div>
  );
}