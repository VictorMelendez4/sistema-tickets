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

  // Estado para la actualización de status (Mantenemos response solo para status)
  const [response, setResponse] = useState({
    status: "",
    solution: "" // Mantener solution por si el backend lo requiere para PUT, aunque el foco es comments
  });

  // NUEVO ESTADO: Para el contenido del nuevo comentario
  const [newComment, setNewComment] = useState("");

  async function loadTicket() {
    try {
      // IMPORTANTE: Tu endpoint debe hacer .populate('comments') y .populate('author')
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data);
      // Inicializamos el status, pero el campo solution ya no es el foco
      setResponse({ status: data.status, solution: data.solution || "" }); 
      setLoading(false);
    } catch (error) {
      console.error(error);
      // Usar toast.error en lugar de toast.success para errores
      toast.error("Error cargando ticket"); 
      navigate("/mis-tickets");
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id, navigate]);

  // Manejar el envío de la actualización de Status/Solución final (Lógica existente)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tickets/${id}`, response);
      toast.success("Ticket actualizado correctamente");
      loadTicket(); // Recargar para ver los cambios de status/solution
    } catch (error) {
      toast.error("Error actualizando ticket");
    }
  };

  // NUEVA LÓGICA: Enviar un nuevo comentario
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Enviar el comentario al endpoint POST /api/comments
      await api.post('/comments', {
        content: newComment,
        ticketId: id
      });

      setNewComment(""); // Limpiar input
      toast.success("Respuesta enviada");
      loadTicket(); // Volver a cargar el ticket para actualizar el historial de comentarios
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar la respuesta");
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container mt-4">
      {/* --- TARJETA PRINCIPAL DEL TICKET --- */}
      <div className="card shadow-lg border-0 mb-4">
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
            {/* ... (Tus otros detalles de metadata) ... */}
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
          
          {/* --- HISTORIAL DE COMENTARIOS (Nuevo) --- */}
          <div className="border-top pt-4 mt-4">
            <h5 className="mb-3 text-secondary"><i className="bi bi-chat-dots"></i> Historial de Conversación</h5>
            <div className="list-group">
              {ticket.comments?.length > 0 ? (
                // Mapear el array de comentarios poblados
                ticket.comments.map((comment) => (
                  <div key={comment._id} className="list-group-item list-group-item-action flex-column align-items-start">
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1 fw-bold">
                        {comment.author?.firstName || 'Usuario'}
                        <span className={`badge ms-2 ${comment.author?.role === 'CLIENT' ? 'bg-info' : 'bg-warning text-dark'}`}>{comment.author?.role}</span>
                      </h6>
                      <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-1" style={{ whiteSpace: "pre-wrap" }}>{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted fst-italic">Aún no hay respuestas en este ticket.</p>
              )}
            </div>
          </div>
          
          {/* --- FORMULARIO PARA AGREGAR NUEVO COMENTARIO --- */}
          <div className="border-top pt-4 mt-4">
            <h5 className="mb-3 text-success"><i className="bi bi-reply-fill"></i> Publicar Respuesta</h5>
            <form onSubmit={handleSubmitComment}>
              <div className="mb-3">
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Escribe tu respuesta aquí para el cliente/agente..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-success">
                Enviar Respuesta
              </button>
            </form>
          </div>

          {/* --- GESTIÓN DE STATUS Y SOLUCIÓN FINAL (Solo para Admin/Soporte) --- */}
          {(usuario.role === "ADMIN" || usuario.role === "SUPPORT") && (
            <div className="border-top pt-4 mt-4">
              <h5 className="mb-3 text-primary"><i className="bi bi-tools"></i> Gestión de Estado y Solución Final</h5>
              <form onSubmit={handleUpdate}>
                {/* ... (Tus campos de status y solution existentes) ... */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Estado</label>
                  <select 
                    className="form-select"
                    value={response.status}
                    onChange={(e) => setResponse({...response, status: e.target.value})}
                  >
                    <option value="ABIERTO">Abierto</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="RESUELTO">Resuelto</option>
                    <option value="CERRADO">Cerrado</option>
                    {/* Incluí 'ESPERANDO_CLIENTE' si es un estado válido en tu backend */}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Solución Final (Opcional)</label>
                  <textarea 
                    className="form-control" 
                    rows="4"
                    placeholder="Escribe aquí la solución final del ticket (Este campo es la solución única, no la conversación)..."
                    value={response.solution}
                    onChange={(e) => setResponse({...response, solution: e.target.value})}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-2"></i> Actualizar Status/Solución
                </button>
              </form>
            </div>
          )}

          {/* VISTA CLIENTE (Solo ver solución FINAL) */}
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