import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

const Dashboard = () => {
    
  const { user } = useAuth();
  
  // Estados
  const [tickets, setTickets] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ total: 0, pendientes: 0, resueltos: 0, enProceso: 0 });
  const [staffMetrics, setStaffMetrics] = useState(null);
  const [monthlyGoal, setMonthlyGoal] = useState(null);
  const [topEmployee, setTopEmployee] = useState(null);
  const [randomTip, setRandomTip] = useState("");

  const tips = [
    "Reinicia tu equipo semanalmente para mejorar el rendimiento.",
    "Usa contraseñas seguras y cámbialas cada 3 meses.",
    "No abras correos de remitentes desconocidos.",
    "Bloquea tu pantalla (Win + L) cuando te levantes.",
    "Mantén tu navegador actualizado."
  ];

  // Función auxiliar para formatear tiempo (minutos -> horas)
  const formatTime = (minutes) => {
    if (!minutes) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  useEffect(() => {
    setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
    
    const fetchData = async () => {
        try {
            if (!user) return;

            // CASO 1: Es CLIENTE
            if (user.role === 'CLIENT') {
                const res = await axios.get("/tickets");
                setTickets(res.data.slice(0, 5));
            }

            // CASO 2: Es STAFF (Admin o Soporte)
            if (["ADMIN", "SUPPORT"].includes(user.role)) {
                const resStats = await axios.get("/tickets/stats/general");
                if(resStats.data) setStats(resStats.data);

                try {
                    const metricsRes = await axios.get("/users/staff/metrics");
                    setStaffMetrics(metricsRes.data);
                    setMonthlyGoal(metricsRes.data.monthlyGoal);
                    setTopEmployee(metricsRes.data.topEmployee);
                } catch (metricErr) {
                    console.warn("Métricas avanzadas no disponibles.");
                }
            }
        } catch (error) {
            console.error("Error dashboard:", error);
        } finally {
            setLoadingData(false);
        }
    };
    fetchData();
  }, [user]);

  // Pantalla de Carga
  if (loadingData) return <div className="p-5 text-center text-muted">Cargando panel...</div>;
  if (!user) return null;

  // ==============================================================================
  // VISTA 1: SI ES CLIENTE (Retornamos aquí y el código no sigue bajando)
  // ==============================================================================
  if (user.role === 'CLIENT') {
    return (
      <div>
        {/* HERO BANNER CLIENTE */}
        <div className="rounded-4 p-5 mb-5 shadow-sm text-white position-relative overflow-hidden"
             style={{
                 background: "linear-gradient(135deg, #0F2C59 0%, #009FBD 100%)",
                 minHeight: "280px",
                 display: "flex",
                 alignItems: "center"
             }}>
            <div className="position-relative z-1">
                <h1 className="fw-bold display-5 mb-3">Hola, {user.firstName}</h1>
                <p className="lead mb-4 opacity-75" style={{maxWidth: "600px"}}>
                    Bienvenido a <strong>North Code</strong>. Estamos listos para ayudarte.
                </p>
                <Link to="/nuevo-ticket" className="btn btn-light text-primary fw-bold px-4 py-2 shadow-sm rounded-pill">
                    <i className="bi bi-plus-lg me-2"></i> Nuevo Reporte
                </Link>
            </div>
        </div>

        <div className="row g-4">
            {/* TABLA DE TICKETS */}
            <div className="col-lg-8">
                <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 py-3">
                        <h5 className="mb-0 fw-bold text-dark">Tickets Recientes</h5>
                    </div>
                    <div className="card-body p-0">
                        {tickets.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                Sin actividad reciente.
                            </div>
                        ) : (
                            <div className="list-group list-group-flush">
                                {tickets.map(ticket => (
                                    <Link key={ticket._id} to={`/tickets/${ticket._id}`} className="list-group-item list-group-item-action px-4 py-3 border-0 border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1 fw-bold text-dark">{ticket.title}</h6>
                                                <small className="text-muted">
                                                    {ticket.status === 'PENDING' && <span className="badge bg-warning text-dark me-2">Pendiente</span>}
                                                    {ticket.status === 'IN_PROGRESS' && <span className="badge bg-info text-dark me-2">En Proceso</span>}
                                                    {ticket.status === 'RESOLVED' && <span className="badge bg-success me-2">Resuelto</span>}
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <i className="bi bi-chevron-right text-muted"></i>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* TIP DEL DIA */}
            <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light">
                    <div className="card-body p-4">
                        <h6 className="fw-bold text-primary mb-2"><i className="bi bi-lightbulb-fill me-2"></i>Tip del día</h6>
                        <p className="text-muted small mb-0 fst-italic">"{randomTip}"</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // VISTA 2: SI ES STAFF (Si llegamos aquí, es porque NO era cliente)
  // ==============================================================================
  return (
    <div>
        <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
                <h2 className="fw-bold text-dark mb-0">Panel de Control</h2>
                <p className="text-muted">Resumen operativo</p>
            </div>
            <span className="badge bg-primary rounded-pill px-3 py-2">{user.department}</span>
        </div>

        {/* TARJETAS KPI */}
        <div className="row g-4 mb-5">
            <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 rounded-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">Total Tickets</h6>
                        <h2 className="display-6 fw-bold text-primary mb-0">{stats.total || 0}</h2>
                    </div>
                    <div className="card-footer bg-primary p-1"></div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 rounded-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">Pendientes</h6>
                        <h2 className="display-6 fw-bold text-warning mb-0">{stats.pendientes || 0}</h2>
                    </div>
                    <div className="card-footer bg-warning p-1"></div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 rounded-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">En Proceso</h6>
                        <h2 className="display-6 fw-bold text-info mb-0">{stats.enProceso || 0}</h2>
                    </div>
                    <div className="card-footer bg-info p-1"></div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 rounded-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">Resueltos</h6>
                        <h2 className="display-6 fw-bold text-success mb-0">{stats.resueltos || 0}</h2>
                    </div>
                    <div className="card-footer bg-success p-1"></div>
                </div>
            </div>
        </div>

        {/* MÉTRICAS DETALLADAS (Solo si cargaron) */}
        {staffMetrics && (
            <div className="row g-4">
                <div className="col-lg-8">
                     <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold m-0 text-dark">Rendimiento</h6>
                        </div>
                        <div className="card-body">
                             <div className="row">
                                <div className="col-6">
                                    <small className="text-muted d-block">Tiempo Promedio Global</small>
                                    <h4 className="fw-bold">{formatTime(staffMetrics.avgResolutionTimeGlobal)}</h4>
                                </div>
                                <div className="col-6">
                                    <small className="text-primary d-block">Mi Tiempo Promedio</small>
                                    <h4 className="fw-bold text-primary">{formatTime(staffMetrics.myAvgResolutionTime)}</h4>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
                         <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                            <h5 className="fw-bold">Meta Mensual</h5>
                            {monthlyGoal ? (
                                <>
                                    <h1 className="display-4 fw-bold mb-0">{monthlyGoal.current}</h1>
                                    <p className="opacity-75">de {monthlyGoal.target} tickets</p>
                                </>
                            ) : (
                                <p>Cargando...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;