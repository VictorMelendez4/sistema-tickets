import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Recibimos 'viewType' desde el Router
export default function TicketList({ viewType }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true); // Ponemos loading al cambiar de vista
      const { data } = await api.get("/tickets");
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar tickets si cambia la vista (ej. de Mis Casos a Bandeja)
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
      fetchTickets(); // Recargamos para que desaparezca de la lista actual
    } catch (error) {
      toast.error("No se pudo tomar el ticket");
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando...</div>;

  // === FILTRADO SEGÚN LA VISTA ===
  let displayedTickets = [];
  let title = "";
  let icon = "";
  let emptyMsg = "";

  if (viewType === "AVAILABLE") {
    // Solo los que NO tienen asignado (Bandeja de Entrada)
    displayedTickets = tickets.filter(t => !t.assignedTo);
    title = `Bandeja de Entrada: ${user.department || "General"}`;
    icon = "bi-inbox";
    emptyMsg = "No hay tickets nuevos en tu departamento.";
  } 
  else if (viewType === "MINE") {
    // Solo los que TIENEN mi ID (Mis Casos)
    displayedTickets = tickets.filter(t => t.assignedTo?._id === user.id);
    title = "Mis Casos Activos";
    icon = "bi-briefcase";
    emptyMsg = "No tienes casos asignados. Ve a la Bandeja de Entrada para tomar uno.";
  }
  else {
    // Vista CLIENTE (Mis tickets creados)
    displayedTickets = tickets; // El backend ya filtra si eres cliente
    title = "Mis Reportes";
    icon = "bi-ticket-perforated";
    emptyMsg = "No has creado reportes aún.";
  }

  // Tarjeta de Ticket
  const TicketCard = ({ ticket }) => (
    <div className="card shadow-sm mb-3 border-0 hover-shadow transition">
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
          
          {/* BOTÓN TOMAR CASO (Solo aparece en Bandeja de Entrada) */}
          {viewType === "AVAILABLE" && (
            <button 
              onClick={() => handleTakeTicket(ticket._id)}
              className="btn btn-sm btn-primary fw-bold"
            >
              ✋ Tomar Caso
            </button>
          )}

          {/* BOTÓN VER DETALLES (Aparece en Mis Casos o Cliente) */}
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
      
      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">
          <i className={`bi ${icon} me-2 text-primary`}></i> {title}
        </h2>
        <span className="badge bg-secondary rounded-pill fs-6">
          {displayedTickets.length}
        </span>
      </div>

      {/* LISTA */}
      <div className="row">
        <div className="col-12">
          {displayedTickets.length > 0 ? (
             displayedTickets.map(t => <TicketCard key={t._id} ticket={t} />)
          ) : (
            <div className="card border-0 bg-light text-center py-5">
              <div className="card-body">
                <i className={`bi ${icon} display-1 text-muted opacity-25 mb-3`}></i>
                <h4 className="text-muted">{emptyMsg}</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}