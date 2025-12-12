import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Estados Generales
  const [tickets, setTickets] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados Staff
  const [stats, setStats] = useState({ total: 0, pendientes: 0, resueltos: 0, enProceso: 0 });
  const [staffMetrics, setStaffMetrics] = useState(null);
  const [monthlyGoal, setMonthlyGoal] = useState(null);
  
  // Estados Cliente
  const [clientStats, setClientStats] = useState({ active: 0, closed: 0 });

  const formatTime = (minutes) => {
    if (!minutes) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            if (!user) return;

            // --- CLIENTE ---
            if (user.role === 'CLIENT') {
                const res = await axios.get("/tickets");
                setTickets(res.data);
                const active = res.data.filter(t => !['RESUELTO', 'CERRADO'].includes(t.status)).length;
                const closed = res.data.filter(t => ['RESUELTO', 'CERRADO'].includes(t.status)).length;
                setClientStats({ active, closed });
            }

            // --- STAFF (Soporte y Admin) ---
            if (["ADMIN", "SUPPORT"].includes(user.role)) {
                // Estadísticas Globales
                const resStats = await axios.get("/tickets/stats/general");
                if(resStats.data) setStats(resStats.data);

                // Métricas Avanzadas
                try {
                    const metricsRes = await axios.get("/users/staff/metrics");
                    setStaffMetrics(metricsRes.data);
                    setMonthlyGoal(metricsRes.data.monthlyGoal);
                } catch (metricErr) { console.warn("Métricas no disponibles."); }

                // Tickets Asignados (Para Soporte)
                if (user.role === 'SUPPORT') {
                    const myTicketsRes = await axios.get("/tickets");
                    // Filtramos pendientes y urgentes
                    const myPending = myTicketsRes.data.filter(t => 
                        t.assignedTo?._id === user._id && 
                        !['RESUELTO', 'CERRADO'].includes(t.status)
                    );
                    setTickets(myPending);
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

  if (loadingData) return <div className="p-5 text-center text-muted">Cargando panel...</div>;
  if (!user) return null;

  // ==============================================================================
  // VISTA 1: CLIENTE (Sin cambios, ya te gustaba)
  // ==============================================================================
  if (user.role === 'CLIENT') {
    return (
      <div>
        <div className="rounded-4 p-5 mb-4 shadow-sm text-white position-relative overflow-hidden"
             style={{ background: "linear-gradient(135deg, #0F2C59 0%, #009FBD 100%)" }}>
            <div className="position-relative z-1">
                <h1 className="fw-bold display-6 mb-2">Hola, {user.firstName} 👋</h1>
                <p className="opacity-75 mb-4">¿En qué podemos ayudarte hoy?</p>
                <div className="d-flex gap-3">
                    <div className="bg-white bg-opacity-25 rounded-3 px-4 py-2 text-center">
                        <h3 className="m-0 fw-bold">{clientStats.active}</h3>
                        <small className="text-white-50">Casos Activos</small>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded-3 px-4 py-2 text-center">
                        <h3 className="m-0 fw-bold">{clientStats.closed}</h3>
                        <small className="text-white-50">Resueltos</small>
                    </div>
                </div>
            </div>
        </div>

        <h5 className="fw-bold text-dark mb-3">¿Qué necesitas reportar?</h5>
        <div className="row g-3 mb-5">
            {[
                // Agregamos 'data' con lo que queremos pre-llenar
                { label: "Falla de Internet", icon: "bi-wifi-off", color: "danger", data: { title: "Sin conexión a Internet", dept: "REDES", priority: "ALTA" } },
                { label: "Equipo Lento", icon: "bi-laptop", color: "warning", data: { title: "Mi equipo está muy lento", dept: "HARDWARE", priority: "MEDIA" } },
                { label: "Licencias / Office", icon: "bi-window-stack", color: "info", data: { title: "Solicitud de Software", dept: "SOFTWARE", priority: "BAJA" } },
                { label: "Falla de Impresora", icon: "bi-printer", color: "secondary", data: { title: "La impresora no responde", dept: "HARDWARE", priority: "MEDIA" } }
            ].map((item, idx) => (
                <div key={idx} className="col-6 col-md-3">
                    {/* Usamos 'state' para pasar los datos al formulario */}
                    <Link to="/nuevo-ticket" state={item.data} className="text-decoration-none">
                        <div className="card border-0 shadow-sm h-100 hover-shadow transition">
                            <div className="card-body text-center py-4">
                                <div className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-circle d-inline-flex p-3 mb-3`}>
                                    <i className={`bi ${item.icon} fs-4`}></i>
                                </div>
                                <h6 className="text-dark fw-bold m-0">{item.label}</h6>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>

        <h5 className="fw-bold text-dark mb-3">Actividad Reciente</h5>
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
                {tickets.length > 0 ? tickets.slice(0, 3).map((t, i) => (
                    <div key={t._id} className="d-flex gap-3 mb-4 position-relative">
                        {i !== 2 && <div className="position-absolute bg-light" style={{width: 2, height: '100%', left: 20, top: 40}}></div>}
                        <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${t.status === 'RESUELTO' ? 'bg-success' : 'bg-primary'} text-white`} style={{width: 40, height: 40, zIndex: 1}}>
                            <i className={`bi ${t.status === 'RESUELTO' ? 'bi-check-lg' : 'bi-clock'}`}></i>
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                                <h6 className="fw-bold mb-1">{t.title}</h6>
                                <span className="badge bg-light text-dark">{t.status}</span>
                            </div>
                            <p className="text-muted small mb-0 text-truncate" style={{maxWidth: '80%'}}>{t.description}</p>
                            <small className="text-muted" style={{fontSize: '0.75rem'}}>Hace {Math.floor((new Date() - new Date(t.createdAt)) / (1000 * 60 * 60 * 24))} días</small>
                        </div>
                    </div>
                )) : <p className="text-muted text-center py-3">No tienes tickets recientes.</p>}
            </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // VISTA 2: SOPORTE (Dashboard Operativo - Sin Rankings Globales)
  // ==============================================================================
  if (user.role === 'SUPPORT') {
      // Extraemos MIS datos del ranking global para mostrar MI desempeño personal
      const myMetric = staffMetrics?.rankingGlobal?.find(agent => agent.name.includes(user.firstName)) || { count: 0, avgRating: 0 };
      
      return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Mi Área de Trabajo</h2>
                    <p className="text-muted">Hola {user.firstName}, aquí está tu resumen de hoy.</p>
                </div>
                <span className="badge bg-primary rounded-pill px-3 py-2">{user.department}</span>
            </div>

            {/* 1. TARJETAS DE RENDIMIENTO PERSONAL (Nuevo) */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-primary text-white h-100">
                        <div className="card-body p-4">
                            <h2 className="display-4 fw-bold mb-0">{myMetric.count || 0}</h2>
                            <p className="mb-0 opacity-75">Tickets Resueltos (Mes)</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-warning text-dark h-100">
                        <div className="card-body p-4">
                            <h2 className="display-4 fw-bold mb-0">{tickets.length}</h2>
                            <p className="mb-0 opacity-75">Pendientes Actuales</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-white text-dark h-100">
                        <div className="card-body p-4 border-start border-success border-5">
                            <h2 className="display-4 fw-bold mb-0 text-success">{myMetric.avgRating?.toFixed(1) || "N/A"} <span className="fs-5 text-muted">★</span></h2>
                            <p className="mb-0 text-muted">Calificación Promedio</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* 2. BANDEJA DE URGENCIAS */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                             <h6 className="fw-bold m-0 text-danger"><i className="bi bi-lightning-fill me-2"></i>Prioridad Alta / Crítica</h6>
                             <Link to="/mis-casos" className="small text-decoration-none fw-bold">Ver todo</Link>
                        </div>
                        <div className="list-group list-group-flush">
                            {tickets.filter(t => ['ALTA', 'CRITICA'].includes(t.priority)).length > 0 ? 
                                tickets.filter(t => ['ALTA', 'CRITICA'].includes(t.priority)).map(t => (
                                <Link key={t._id} to={`/tickets/${t._id}`} className="list-group-item list-group-item-action px-4 py-3 border-0 border-bottom border-start border-danger border-3 my-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="badge bg-danger small">URGENTE</span>
                                                <h6 className="mb-0 fw-bold text-dark">{t.title}</h6>
                                            </div>
                                            <small className="text-muted">De: {t.createdBy?.firstName}</small>
                                        </div>
                                        <i className="bi bi-arrow-right-circle-fill text-danger fs-5"></i>
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-check-circle fs-1 d-block mb-2 text-success"></i>
                                    ¡Todo bajo control! No hay urgencias.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. COLUMNA DERECHA: PULSO DEL DEPTO */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-dark mb-3">Tus Tiempos</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tu Promedio</span>
                                <span className="fw-bold text-primary">{formatTime(staffMetrics?.myAvgResolutionTime)}</span>
                            </div>
                            <small className="text-muted fst-italic">Mantén este número bajo para mejorar tu calificación.</small>
                        </div>
                    </div>
                    
                    {/* Tarjeta Informativa */}
                    <div className="card border-0 shadow-sm rounded-4 bg-light">
                        <div className="card-body p-4">
                            <div className="d-flex gap-3">
                                <i className="bi bi-info-circle-fill text-primary fs-3"></i>
                                <div>
                                    <h6 className="fw-bold">Recordatorio</h6>
                                    <p className="small text-muted mb-0">Revisa la bandeja de "Sin Asignar" cada 2 horas para apoyar al equipo.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // ==============================================================================
  // VISTA 3: ADMIN (Dashboard Global con Rankings y Todo)
  // ==============================================================================
  return (
    <div>
        <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
                <h2 className="fw-bold text-dark mb-0">Panel de Administración</h2>
                <p className="text-muted">Visión global del sistema</p>
            </div>
            <span className="badge bg-dark rounded-pill px-3 py-2">ADMIN</span>
        </div>

        {/* TARJETAS KPI GLOBALES */}
        <div className="row g-4 mb-5">
            <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 rounded-4 border-bottom border-primary border-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">Total Tickets</h6>
                        <h2 className="display-6 fw-bold text-dark mb-0">{stats.total || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                 <div className="card border-0 shadow-sm h-100 rounded-4 border-bottom border-warning border-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">Pendientes</h6>
                        <h2 className="display-6 fw-bold text-dark mb-0">{stats.pendientes || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 rounded-4 border-bottom border-info border-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">En Proceso</h6>
                        <h2 className="display-6 fw-bold text-dark mb-0">{stats.enProceso || 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                 <div className="card border-0 shadow-sm h-100 rounded-4 border-bottom border-success border-4">
                    <div className="card-body p-4">
                        <h6 className="text-uppercase text-muted fw-bold small">Resueltos</h6>
                        <h2 className="display-6 fw-bold text-dark mb-0">{stats.resueltos || 0}</h2>
                    </div>
                </div>
            </div>
        </div>

        {/* RANKINGS Y METAS (SOLO PARA ADMIN) */}
        {staffMetrics && (
            <div className="row g-4">
                <div className="col-lg-8">
                     <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold m-0 text-dark"><i className="bi bi-trophy-fill text-warning me-2"></i>Ranking de Rendimiento</h6>
                        </div>
                        <div className="card-body p-0">
                             <table className="table table-hover align-middle mb-0">
                                <thead className="table-light"><tr><th>Agente</th><th>Depto</th><th className="text-center">Tickets</th><th className="text-center">Calif.</th></tr></thead>
                                <tbody>
                                    {staffMetrics.rankingGlobal?.slice(0, 10).map((agent, i) => (
                                        <tr key={i}>
                                            <td className="fw-bold px-3">{i+1}. {agent.name}</td>
                                            <td><span className="badge bg-light text-dark border">{agent.department}</span></td>
                                            <td className="text-center">{agent.count}</td>
                                            <td className="text-center fw-bold text-warning">{agent.avgRating?.toFixed(1)} ★</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-dark text-white mb-3">
                         <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                            <h5 className="fw-bold text-white-50">Meta Mensual Global</h5>
                            {monthlyGoal ? (
                                <>
                                    <h1 className="display-3 fw-bold mb-0 text-white">{monthlyGoal.current}</h1>
                                    <div className="progress bg-white bg-opacity-25 mt-3" style={{height: 6}}>
                                        <div className="progress-bar bg-success" style={{width: `${Math.min((monthlyGoal.current / monthlyGoal.target)*100, 100)}%`}}></div>
                                    </div>
                                    <p className="mt-2 text-white-50 small">Objetivo: {monthlyGoal.target} tickets</p>
                                </>
                            ) : <p>Cargando...</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;