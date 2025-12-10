import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import * as XLSX from "xlsx"; 

export default function TicketList({ viewType }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // <--- 1. ESTADO DEL BUSCADOR
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tickets");
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [viewType]);

  const handleTakeTicket = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}`, { 
        assignedTo: user.id,
        status: "EN_PROCESO" 
      });
      toast.success("¡Caso asignado a ti!");
      fetchTickets();
    } catch (error) {
      toast.error("No se pudo tomar el ticket");
    }
  };

  const exportToExcel = () => {
    // Exportamos LO QUE SE VE (filtrado)
    const dataToExport = filteredTickets.map(t => ({
      "ID Ticket": t._id.slice(-6).toUpperCase(), 
      "Asunto": t.title,
      "Estado": t.status,
      "Prioridad": t.priority,
      "Departamento": t.department,
      "Solicitante": t.createdBy?.email || "Desconocido",
      "Asignado A": t.assignedTo?.email || "Sin asignar",
      "Fecha Creación": new Date(t.createdAt).toLocaleDateString(),
      "Calificación": t.rating > 0 ? `${t.rating} ★` : "N/A",
      "Comentario Cliente": t.feedback || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Tickets");
    XLSX.writeFile(workbook, `Reporte_Tickets_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Reporte descargado correctamente 📄");
  };

  const getSLAStyle = (createdAt, status) => {
    if (status === "RESUELTO" || status === "CERRADO") return {};
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = Math.abs(now - created) / 36e5; 

    if (diffHours > 48) {
      return { borderLeft: "5px solid #ef4444", animation: "pulse-red 2s infinite" };
    } else if (diffHours > 24) {
      return { borderLeft: "5px solid #f59e0b" };
    } else {
      return { borderLeft: "5px solid #10b981" };
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando...</div>;

  // === 2. LÓGICA DE FILTRADO ===
  let baseList = [];
  let title = "";
  let icon = "";
  let emptyMsg = "";

  // A. Primero elegimos qué lista base usar según el Rol/Vista
  if (viewType === "AVAILABLE") {
    baseList = tickets.filter(t => !t.assignedTo);
    title = `Bandeja: ${user.department || "General"}`;
    icon = "bi-inbox";
    emptyMsg = "No hay tickets nuevos.";
  } 
  else if (viewType === "MINE") {
    baseList = tickets.filter(t => t.assignedTo?._id === user.id);
    title = "Mis Casos Activos";
    icon = "bi-briefcase";
    emptyMsg = "No tienes casos asignados.";
  }
  else {
    baseList = tickets; 
    title = user.role === "CLIENT" ? "Mis Reportes" : "Todos los Tickets";
    icon = "bi-ticket-perforated";
    emptyMsg = "No hay reportes registrados.";
  }

  // B. Luego aplicamos el Buscador sobre esa lista base
  const filteredTickets = baseList.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TicketCard = ({ ticket }) => (
    <div 
        className="card shadow-sm mb-3 hover-shadow transition" 
        style={{ 
            border: "1px solid #444", 
            overflow: "hidden",      
            ...getSLAStyle(ticket.createdAt, ticket.status)
        }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="fw-bold mb-1">
              <Link to={`/tickets/${ticket._id}`} className="text-decoration-none text-dark">
                {ticket.title}
              </Link>
            </h5>
            <div className="text-muted small mb-2">
              <span className="badge bg-light text-dark border me-2">{ticket.department}</span>
              <span className={`badge ${ticket.priority === 'CRITICA' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                {ticket.priority}
              </span>
              <span className="ms-2 text-muted" style={{fontSize: "0.8em"}}>
                Hace {Math.floor((new Date() - new Date(ticket.createdAt)) / 36e5)} horas
              </span>
            </div>
          </div>
          <span className={`badge ${ticket.status === 'ABIERTO' ? 'bg-success' : 'bg-secondary'}`}>
            {ticket.status}
          </span>
        </div>
        
        <p className="small text-secondary text-truncate mb-3" style={{maxWidth: "800px"}}>
          {ticket.description}
        </p>
        
        <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
          <small className="text-muted">
            <i className="bi bi-person me-1"></i> 
            Solicitante: <strong>{ticket.createdBy?.firstName || "Cliente"}</strong>
          </small>
          
          {viewType === "AVAILABLE" && (
            <button onClick={() => handleTakeTicket(ticket._id)} className="btn btn-sm btn-primary fw-bold">
              ✋ Tomar Caso
            </button>
          )}

          {viewType !== "AVAILABLE" && (
             <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-outline-secondary">
                Ver Detalles <i className="bi bi-arrow-right ms-1"></i>
             </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid" style={{ maxWidth: "1000px" }}>
      <style>
        {`@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }`}
      </style>

      {/* CABECERA Y BUSCADOR */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
            <h2 className="fw-bold text-dark mb-0">
                <i className={`bi ${icon} me-2 text-primary`}></i> {title}
            </h2>
        </div>
        
        <div className="col-md-6 d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
             {/* 3. INPUT DE BÚSQUEDA */}
            <div className="input-group" style={{maxWidth: "300px"}}>
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                <input 
                    type="text" 
                    className="form-control border-start-0 ps-0" 
                    placeholder="Buscar ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {user.role === "ADMIN" && filteredTickets.length > 0 && (
                <button onClick={exportToExcel} className="btn btn-success text-white shadow-sm" title="Descargar Excel">
                    <i className="bi bi-file-earmark-excel"></i>
                </button>
            )}

            {user.role === "CLIENT" && (
                <Link to="/nuevo-ticket" className="btn btn-primary fw-bold shadow-sm">
                    <i className="bi bi-plus-lg"></i>
                </Link>
            )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {filteredTickets.length > 0 ? (
             filteredTickets.map(t => <TicketCard key={t._id} ticket={t} />)
          ) : (
            <div className="card border-0 bg-light text-center py-5">
              <div className="card-body">
                <i className={`bi ${icon} display-1 text-muted opacity-25 mb-3`}></i>
                <h4 className="text-muted">
                    {searchTerm ? "No se encontraron resultados" : emptyMsg}
                </h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}