import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar Tickets al iniciar
// src/pages/TicketList.jsx

useEffect(() => {
  const fetchTickets = async () => {
    try {
      const endpoint = user.role === "CLIENT" ? "/tickets" : "/tickets"; // Ajusta si tienes rutas distintas
      // Ojo: Tu backend usa /tickets para ambos, filtrando por token.
      
      const { data } = await api.get("/tickets");
      setTickets(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      // Si el error es 401 (No autorizado), es normal que saque al login
      if (error.response?.status === 401) {
        // El interceptor de axios o el AuthContext deberían manejar esto,
        // pero por si acaso:
        toast.error("Sesión expirada");
      } else {
        toast.error("Error al cargar los tickets");
      }
      setLoading(false);
    }
  };
  if (user) fetchTickets(); // Solo ejecutar si hay usuario
}, [user]);

  // Función para obtener color según el estado
  const getStatusBadge = (status) => {
    const colors = {
      ABIERTO: "bg-success",
      EN_PROCESO: "bg-warning text-dark",
      ESPERANDO_CLIENTE: "bg-info text-dark",
      RESUELTO: "bg-primary",
      CERRADO: "bg-secondary",
    };
    return `badge ${colors[status] || "bg-secondary"}`;
  };

  // Función para obtener color de prioridad
  const getPriorityBadge = (priority) => {
    return priority === "CRITICA" ? "text-danger fw-bold" : "text-dark";
  };

  return (
    <div className="container-fluid" style={{ maxWidth: "1400px" }}>
      
      {/* Título Principal */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0">
            {user?.role === "CLIENT" ? "Mis Tickets" : "Centro de Soporte"}
          </h2>
          <p className="text-muted small">
            {user?.role === "CLIENT" 
              ? "Consulta el estado de tus solicitudes recientes."
              : "Gestiona y asigna las incidencias pendientes."}
          </p>
        </div>
      </div>

      <div className="row g-4">
        
        {/* === COLUMNA IZQUIERDA: TABLA DE TICKETS === */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Asunto</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Categoría</th>
                      {user?.role !== "CLIENT" && <th>Solicitante</th>}
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">Cargando...</td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No hay tickets registrados.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((t) => (
                        <tr 
                          key={t._id} 
                          onClick={() => setSelectedTicket(t)} 
                          style={{ cursor: "pointer" }}
                          className={selectedTicket?._id === t._id ? "table-active" : ""}
                        >
                          <td className="ps-4 fw-bold text-primary">
                            {t.title}
                          </td>
                          <td>
                            <span className={getStatusBadge(t.status)}>{t.status}</span>
                          </td>
                          <td>
                            <span className={getPriorityBadge(t.priority)}>{t.priority}</span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{t.category}</span>
                          </td>
                          {user?.role !== "CLIENT" && (
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: 24, height: 24, fontSize: 10}}>
                                  {t.createdBy?.firstName?.charAt(0)}
                                </div>
                                <small>{t.createdBy?.firstName}</small>
                              </div>
                            </td>
                          )}
                          <td className="text-muted small">
                            {new Date(t.createdAt).toLocaleDateString()}
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

        {/* === COLUMNA DERECHA: VISTA PREVIA Y ACCIÓN === */}
        <div className="col-lg-4">
          {selectedTicket ? (
            <div className="card shadow-sm border-0 sticky-top" style={{ top: "20px" }}>
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">Vista Rápida</h5>
              </div>
              <div className="card-body">
                
                {/* Info Clave */}
                <h4 className="card-title fw-bold mb-3">{selectedTicket.title}</h4>
                <div className="d-flex gap-2 mb-3">
                  <span className={getStatusBadge(selectedTicket.status)}>
                    {selectedTicket.status}
                  </span>
                  <span className="badge bg-light text-dark border">
                    {selectedTicket.category}
                  </span>
                </div>

                <div className="bg-light p-3 rounded mb-4">
                  <h6 className="fw-bold text-muted small text-uppercase">Descripción</h6>
                  <p className="mb-0 small text-dark" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedTicket.description.length > 150 
                      ? selectedTicket.description.substring(0, 150) + "..." 
                      : selectedTicket.description}
                  </p>
                </div>

                {/* Info Adicional */}
                <ul className="list-group list-group-flush mb-4 small">
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">ID Ticket:</span>
                    <span className="font-monospace">#{selectedTicket._id.slice(-6)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Solicitante:</span>
                    <span className="fw-bold">{selectedTicket.createdBy?.email}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Asignado a:</span>
                    <span>{selectedTicket.assignedTo ? selectedTicket.assignedTo.firstName : "Sin asignar"}</span>
                  </li>
                </ul>

                {/* BOTÓN DE ACCIÓN PRINCIPAL */}
                <div className="d-grid">
                  <button 
                    onClick={() => navigate(`/tickets/${selectedTicket._id}`)} 
                    className="btn btn-primary py-2 fw-bold"
                  >
                    <i className="bi bi-box-arrow-up-right me-2"></i>
                    Abrir Ticket y Chat
                  </button>
                </div>

              </div>
            </div>
          ) : (
            /* Placeholder cuando no hay selección */
            <div className="card border-0 bg-light border-dashed text-center py-5">
              <div className="card-body text-muted">
                <i className="bi bi-cursor-fill display-4 mb-3 opacity-25"></i>
                <h5>Selecciona un ticket</h5>
                <p className="small">Haz clic en una fila de la izquierda para ver los detalles y acceder al chat.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}