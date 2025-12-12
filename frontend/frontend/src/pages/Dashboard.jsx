import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Estados
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

            // --- LÓGICA CLIENTE ---
            if (user.role === 'CLIENT') {
                const res = await axios.get("/tickets");
                setTickets(res.data);
                // Calcular resumen rápido para el cliente
                const active = res.data.filter(t => t.status !== 'RESUELTO' && t.status !== 'CERRADO').length;
                const closed = res.data.filter(t => t.status === 'RESUELTO' || t.status === 'CERRADO').length;
                setClientStats({ active, closed });
            }

            // --- LÓGICA STAFF ---
            if (["ADMIN", "SUPPORT"].includes(user.role)) {
                const resStats = await axios.get("/tickets/stats/general");
                if(resStats.data) setStats(resStats.data);

                try {
                    const metricsRes = await axios.get("/users/staff/metrics");
                    setStaffMetrics(metricsRes.data);
                    setMonthlyGoal(metricsRes.data.monthlyGoal);
                } catch (metricErr) {
                    console.warn("Métricas no disponibles.");
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
  // VISTA CLIENTE MEJORADA 🚀
  // ==============================================================================
  if (user.role === 'CLIENT') {
    return (
      <div>
        {/* 1. HERO BANNER */}
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

        {/* 2. ACCESOS RÁPIDOS */}
        <h5 className="fw-bold text-dark mb-3">¿Qué necesitas reportar?</h5>
        <div className="row g-3 mb-5">
            {[
                { label: "Falla de Internet", icon: "bi-wifi-off", color: "danger" },
                { label: "Equipo Lento", icon: "bi-laptop", color: "warning" },
                { label: "Software / Licencias", icon: "bi-window-stack", color: "info" },
                { label: "Impresora", icon: "bi-printer", color: "secondary" }
            ].map((item, idx) => (
                <div key={idx} className="col-6 col-md-3">
                    <Link to="/nuevo-ticket" className="text-decoration-none">
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

        {/* 3. LÍNEA DE TIEMPO (Últimos 3 tickets) */}
        <h5 className="fw-bold text-dark mb-3">Actividad Reciente</h5>
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
                {tickets.slice(0, 3).map((t, i) => (
                    <div key={t._id} className="d-flex gap-3 mb-4 position-relative">
                        {/* Línea vertical conectora */}
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
                ))}
                {tickets.length === 0 && <p className="text-muted text-center py-3">No tienes tickets recientes.</p>}
                
                {tickets.length > 0 && (
                    <div className="text-center border-top pt-3">
                        <Link to="/mis-tickets" className="btn btn-link text-decoration-none fw-bold">Ver historial completo</Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // VISTA STAFF MEJORADA (Con Rankings) 👮‍♂️
  // ==============================================================================
  
  // Filtramos el ranking global para obtener el del departamento del usuario
  const myDeptRanking = staffMetrics?.rankingGlobal?.filter(agent => agent.department === user.department) || [];

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

        {/* RANKINGS Y METAS */}
        {staffMetrics && (
            <div className="row g-4">
                {/* COLUMNA IZQUIERDA: Rankings */}
                <div className="col-lg-8">
                     <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold m-0 text-dark"><i className="bi bi-trophy-fill text-warning me-2"></i>Ranking de Calidad</h6>
                        </div>
                        <div className="card-body p-0">
                             <ul className="nav nav-tabs nav-justified" id="rankingTab" role="tablist">
                                <li className="nav-item">
                                    <button className="nav-link active fw-bold text-dark" id="global-tab" data-bs-toggle="tab" data-bs-target="#global" type="button">🏆 Global</button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link fw-bold text-dark" id="dept-tab" data-bs-toggle="tab" data-bs-target="#dept" type="button">🏢 Mi Depto</button>
                                </li>
                             </ul>
                             <div className="tab-content p-3" id="rankingTabContent">
                                {/* TABLA GLOBAL */}
                                <div className="tab-pane fade show active" id="global">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light"><tr><th>Agente</th><th>Depto</th><th className="text-center">Tickets</th><th className="text-center">Calif.</th></tr></thead>
                                        <tbody>
                                            {staffMetrics.rankingGlobal?.slice(0, 5).map((agent, i) => (
                                                <tr key={i}>
                                                    <td className="fw-bold">{i+1}. {agent.name}</td>
                                                    <td><span className="badge bg-light text-dark border">{agent.department}</span></td>
                                                    <td className="text-center">{agent.count}</td>
                                                    <td className="text-center fw-bold text-warning">{agent.avgRating?.toFixed(1)} ★</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* TABLA DEPARTAMENTO */}
                                <div className="tab-pane fade" id="dept">
                                    {myDeptRanking.length > 0 ? (
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light"><tr><th>Agente</th><th className="text-center">Tickets</th><th className="text-center">Calif.</th></tr></thead>
                                            <tbody>
                                                {myDeptRanking.map((agent, i) => (
                                                    <tr key={i}>
                                                        <td className="fw-bold">{i+1}. {agent.name}</td>
                                                        <td className="text-center">{agent.count}</td>
                                                        <td className="text-center fw-bold text-warning">{agent.avgRating?.toFixed(1)} ★</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-center text-muted p-3">No hay datos en tu departamento aún.</p>}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Metas y Tiempos */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-dark text-white mb-3">
                         <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                            <h5 className="fw-bold text-white-50">Meta Mensual</h5>
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

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-dark mb-3">Tiempos de Respuesta</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Global</span>
                                <span className="fw-bold">{formatTime(staffMetrics.avgResolutionTimeGlobal)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-primary">Tu Promedio</span>
                                <span className="fw-bold text-primary">{formatTime(staffMetrics.myAvgResolutionTime)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;