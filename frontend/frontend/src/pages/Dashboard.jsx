import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// LISTA DE TIPS ALEATORIOS
const techTips = [
    "Antes de reportar un fallo, intenta reiniciar tu equipo. ¡Soluciona el 80% de los problemas!",
    "Si tu contraseña no funciona, verifica que la tecla 'Bloq Mayús' no esté activada.",
    "Nunca compartas tu contraseña con nadie, ni siquiera con el equipo de soporte.",
    "Mantén tu navegador actualizado para evitar problemas de seguridad.",
    "Si el internet está lento, intenta desconectar y conectar tu Wi-Fi.",
    "Revisa si los cables de corriente están bien conectados antes de llamar a soporte.",
    "Haz copias de seguridad de tus archivos importantes en la nube frecuentemente.",
    "Usa contraseñas seguras que incluyan números, mayúsculas y símbolos."
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0, avgRating: 0 });
  const [urgentTickets, setUrgentTickets] = useState([]); 
  const [topAgents, setTopAgents] = useState([]); 
  const [monthlyGoal, setMonthlyGoal] = useState({ current: 0, target: 50, percent: 0 }); 
  const [myRecentTickets, setMyRecentTickets] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Estado para el tip del día
  const [todaysTip, setTodaysTip] = useState("");

  useEffect(() => {
    // 🎲 Elegir tip aleatorio al cargar
    const randomIndex = Math.floor(Math.random() * techTips.length);
    setTodaysTip(techTips[randomIndex]);

    const fetchData = async () => {
      try {
        const { data } = await api.get("/tickets"); 

        // 1. Métricas Básicas
        const total = data.length;
        const pending = data.filter(t => t.status !== "RESUELTO" && t.status !== "CERRADO").length;
        const closed = data.filter(t => t.status === "CERRADO").length;
        
        const ratedTickets = data.filter(t => t.rating > 0);
        const sumRating = ratedTickets.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = ratedTickets.length > 0 ? (sumRating / ratedTickets.length).toFixed(1) : 0;

        setStats({ total, pending, closed, avgRating });

        // 2. Clientes
        if (user.role === "CLIENT") {
            setMyRecentTickets(data.slice(0, 3));
        }

        // 3. Staff
        if (user.role !== "CLIENT") {
            const urgents = data.filter(t => 
                (t.priority === "CRITICA" || t.priority === "ALTA") && 
                (t.status === "ABIERTO" || t.status === "EN_PROCESO")
            );
            setUrgentTickets(urgents.slice(0, 5));

            const currentMonth = new Date().getMonth();
            const thisMonthTickets = data.filter(t => new Date(t.createdAt).getMonth() === currentMonth).length;
            const target = 50; 
            const percent = Math.min(100, Math.round((thisMonthTickets / target) * 100));
            setMonthlyGoal({ current: thisMonthTickets, target, percent });

            // Top Agents
            const agentMap = {};
            ratedTickets.forEach(t => {
                if (t.assignedTo) {
                    const agentId = t.assignedTo._id;
                    const agentName = `${t.assignedTo.firstName} ${t.assignedTo.lastName}`;
                    const agentDept = t.assignedTo.department || "General";
                    
                    if (!agentMap[agentId]) {
                        agentMap[agentId] = { name: agentName, dept: agentDept, totalStars: 0, count: 0 };
                    }
                    agentMap[agentId].totalStars += t.rating;
                    agentMap[agentId].count += 1;
                }
            });

            const ranking = Object.values(agentMap)
                .map(a => ({ 
                    name: a.name, 
                    dept: a.dept,
                    avg: (a.totalStars / a.count).toFixed(1), 
                    count: a.count 
                }))
                .sort((a, b) => b.avg - a.avg)
                .slice(0, 5);
            
            setTopAgents(ranking);
        }

      } catch (error) {
        console.error("Error cargando dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // === CLIENT DASHBOARD ===
  const ClientDashboard = () => (
    <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold mb-0">Hola, {user.firstName} 👋</h2>
                <p className="text-muted">Bienvenido a <strong>North Code</strong>. ¿En qué podemos ayudarte?</p>
            </div>
            <Link to="/nuevo-ticket" className="btn btn-primary btn-lg shadow-sm fw-bold">
                <i className="bi bi-plus-lg me-2"></i> Nuevo Reporte
            </Link>
        </div>

        <div className="row g-4">
            <div className="col-lg-8">
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm p-3 bg-primary text-white h-100">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="fw-bold mb-0">{stats.pending}</h2>
                                    <small className="opacity-75">Tickets En Proceso</small>
                                </div>
                                <i className="bi bi-hourglass-split fs-1 opacity-25"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm p-3 bg-success text-white h-100">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="fw-bold mb-0">{stats.closed}</h2>
                                    <small className="opacity-75">Problemas Resueltos</small>
                                </div>
                                <i className="bi bi-check-circle fs-1 opacity-25"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white fw-bold py-3">
                        <i className="bi bi-clock-history me-2"></i> Tu Actividad Reciente
                    </div>
                    <div className="card-body p-0">
                        {myRecentTickets.length > 0 ? (
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Asunto</th>
                                        <th>Estado</th>
                                        <th>Fecha</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRecentTickets.map(t => (
                                        <tr key={t._id}>
                                            <td className="ps-4 fw-bold">{t.title}</td>
                                            <td>
                                                <span className={`badge ${t.status === 'ABIERTO' ? 'bg-secondary' : t.status === 'RESUELTO' ? 'bg-success' : 'bg-primary'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="text-muted small">{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td className="text-end pe-3">
                                                <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-light text-primary fw-bold">Ver</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-4 text-center text-muted">Aún no tienes tickets recientes.</div>
                        )}
                    </div>
                    {myRecentTickets.length > 0 && (
                        <div className="card-footer bg-white text-center border-0 py-3">
                            <Link to="/mis-tickets" className="text-decoration-none fw-bold small">Ver historial completo →</Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="col-lg-4">
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">📞 Soporte North Code</h6>
                        <p className="small text-muted mb-2"><i className="bi bi-telephone me-2"></i> +52 1 871 211 8757</p>
                        <p className="small text-muted mb-0"><i className="bi bi-envelope me-2"></i> northcode@gmail.com</p>
                    </div>
                </div>

                <div className="card border-0 shadow-sm bg-light">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">💡 Tip del Día</h6>
                        {/* 👇 AQUI SE MUESTRA EL TIP RANDOM */}
                        <p className="small text-muted fst-italic mb-0">
                            "{todaysTip}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // === STAFF DASHBOARD ===
  const StaffDashboard = () => (
    <div>
        <h2 className="fw-bold mb-4">Panel de Control - North Code</h2>
        
        {/* 1. Métricas */}
        <div className="row g-4 mb-4">
            <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 border-start border-4 border-primary">
                    <div className="d-flex justify-content-between">
                        <div><small className="text-muted fw-bold">TOTAL</small><h3 className="fw-bold mb-0">{stats.total}</h3></div>
                        <i className="bi bi-ticket-detailed fs-1 text-primary opacity-25"></i>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 border-start border-4 border-warning">
                    <div className="d-flex justify-content-between">
                        <div><small className="text-muted fw-bold">PENDIENTES</small><h3 className="fw-bold mb-0">{stats.pending}</h3></div>
                        <i className="bi bi-hourglass-split fs-1 text-warning opacity-25"></i>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 border-start border-4 border-success">
                    <div className="d-flex justify-content-between">
                        <div><small className="text-muted fw-bold">RESUELTOS</small><h3 className="fw-bold mb-0">{stats.closed}</h3></div>
                        <i className="bi bi-check-circle fs-1 text-success opacity-25"></i>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 border-start border-4 border-info">
                    <div className="d-flex justify-content-between">
                        <div><small className="text-muted fw-bold">CALIDAD</small><h3 className="fw-bold mb-0">{stats.avgRating} ★</h3></div>
                        <i className="bi bi-star-fill fs-1 text-info opacity-25"></i>
                    </div>
                </div>
            </div>
        </div>

        <div className="row g-4 mb-4">
            {/* 2. Meta del Mes */}
            <div className="col-md-6">
                <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
                        <span>🎯 Meta del Mes</span>
                        <span className="badge bg-primary rounded-pill">{monthlyGoal.current} / {monthlyGoal.target} Tickets</span>
                    </div>
                    <div className="card-body d-flex flex-column justify-content-center">
                        <h5 className="text-center mb-3 text-muted">Progreso Mensual</h5>
                        <div className="progress" style={{ height: "25px" }}>
                            <div 
                                className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                                role="progressbar" 
                                style={{ width: `${monthlyGoal.percent}%` }}
                            >
                                {monthlyGoal.percent}%
                            </div>
                        </div>
                        <p className="text-center small text-muted mt-2">
                            ¡Llevamos {monthlyGoal.current} tickets registrados este mes!
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Top Soportes */}
            <div className="col-md-6">
                <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-white fw-bold py-3 text-warning-emphasis">
                        <i className="bi bi-trophy-fill me-2 text-warning"></i> Soportes Mejor Calificados
                    </div>
                    <div className="card-body p-0">
                        {topAgents.length > 0 ? (
                            <table className="table mb-0 align-middle">
                                <tbody>
                                    {topAgents.map((agent, index) => (
                                        <tr key={index}>
                                            <td className="ps-4" style={{width: "50px"}}>
                                                {index === 0 && <span className="fs-5">🥇</span>}
                                                {index === 1 && <span className="fs-5">🥈</span>}
                                                {index === 2 && <span className="fs-5">🥉</span>}
                                                {index > 2 && <span className="fw-bold text-muted">#{index + 1}</span>}
                                            </td>
                                            <td>
                                                <div className="fw-bold">{agent.name}</div>
                                                <div className="small text-muted" style={{fontSize: "0.8rem"}}>
                                                    <i className="bi bi-building me-1"></i> {agent.dept}
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <span className="badge bg-warning text-dark border">
                                                    {agent.avg} ★ <small className="opacity-75">({agent.count})</small>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-4 text-center text-muted">
                                Aún no hay suficientes calificaciones.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* 4. Lista Urgencia */}
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3 text-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> Atención Inmediata (Tickets Críticos)
            </div>
            <div className="card-body p-0">
                {urgentTickets.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Asunto</th>
                                    <th>Prioridad</th>
                                    <th>Tiempo Abierto</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urgentTickets.map(ticket => (
                                    <tr key={ticket._id}>
                                        <td className="ps-4 fw-bold">{ticket.title}</td>
                                        <td>
                                            <span className="badge bg-danger">{ticket.priority}</span>
                                        </td>
                                        <td className="text-muted small">
                                            {Math.floor((new Date() - new Date(ticket.createdAt)) / 36e5)} horas
                                        </td>
                                        <td>
                                            <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-outline-danger">
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 text-center text-success">
                        <i className="bi bi-check-circle-fill me-2"></i> ¡No hay emergencias pendientes!
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  if (loading) return <div className="p-5 text-center">Cargando Dashboard...</div>;

  return (
    <div className="container-fluid" style={{ maxWidth: "1200px" }}>
      {user.role === "CLIENT" ? <ClientDashboard /> : <StaffDashboard />}
    </div>
  );
}