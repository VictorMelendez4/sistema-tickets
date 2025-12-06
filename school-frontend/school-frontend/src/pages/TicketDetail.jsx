import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario de respuesta
  const [response, setResponse] = useState({
    status: "",
    solution: ""
  });

  useEffect(() => {
    async function loadTicket() {
      try {
        const { data } = await api.get(`/tickets/${id}`);
        setTicket(data);
        setResponse({ status: data.status, solution: data.solution || "" });
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.success("Error cargando ticket");
        navigate("/mis-tickets");
      }
    }
    loadTicket();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tickets/${id}`, response);
      toast.success("Ticket actualizado correctamente");
      navigate("/"); // Volver al dashboard
    } catch (error) {
      toast.success("Error actualizando ticket");
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Ticket #{id.slice(-6)}</h4>
          <span className="badge bg-light text-dark">{ticket.status}</span>
        </div>
        
        <div className="card-body">
          <h3 className="card-title fw-bold mb-3">{ticket.title}</h3>
          
          <div className="alert alert-secondary">
            <strong>Descripción del problema:</strong>
            <p className="mt-2 mb-0" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <p className="text-muted mb-1">Reportado por:</p>
              <p className="fw-bold">{ticket.createdBy?.firstName} ({ticket.createdBy?.email})</p>
            </div>
            <div className="col-md-6">
              <p className="text-muted mb-1">Categoría / Prioridad:</p>
              <p className="fw-bold">
                <span className="badge bg-info text-dark me-2">{ticket.category}</span>
                <span className={`badge ${ticket.priority === 'CRITICA' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                  {ticket.priority}
                </span>
              </p>
            </div>
          </div>

          {/* ÁREA DE RESOLUCIÓN (Solo para Admin/Soporte) */}
          {(usuario.role === "ADMIN" || usuario.role === "SUPPORT") && (
            <div className="border-top pt-4">
              <h5 className="mb-3 text-primary"><i className="bi bi-tools"></i> Gestión del Ticket</h5>
              <form onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Estado</label>
                  <select 
                    className="form-select"
                    value={response.status}
                    onChange={(e) => setResponse({...response, status: e.target.value})}
                  >
                    <option value="ABIERTO">Abierto</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="ESPERANDO_CLIENTE">Esperando Respuesta</option>
                    <option value="RESUELTO">Resuelto</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Solución / Comentarios</label>
                  <textarea 
                    className="form-control" 
                    rows="4"
                    placeholder="Escribe aquí la solución técnica..."
                    value={response.solution}
                    onChange={(e) => setResponse({...response, solution: e.target.value})}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-success">
                  <i className="bi bi-save me-2"></i> Actualizar Ticket
                </button>
              </form>
            </div>
          )}

          {/* VISTA CLIENTE (Solo ver solución) */}
          {usuario.role === "CLIENT" && ticket.solution && (
            <div className="alert alert-success mt-3">
              <h5>💡 Solución del Técnico:</h5>
              <p className="mb-0">{ticket.solution}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}