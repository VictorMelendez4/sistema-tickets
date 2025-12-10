import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA ADMIN/SOPORTE
  const [agents, setAgents] = useState([]); 
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInternal, setIsInternal] = useState(false); // <--- NUEVO: Checkbox nota interna

  // ESTADOS PARA CALIFICACIÓN
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/tickets/${id}`);
        setTicket(data);
        setComments(data.comments || []);
        
        if (data.rating) {
            setRating(data.rating);
            setFeedback(data.feedback);
        }

        if (user.role === "ADMIN" || user.role === "SUPPORT") {
          const agentsRes = await api.get("/auth/support-agents");
          setAgents(agentsRes.data);
        }
      } catch (error) {
        toast.error("Error cargando información");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, user]);

  // --- 1. ACTUALIZAR ESTADO O AGENTE ---
  const handleUpdate = async (field, value) => {
    setIsUpdating(true);
    try {
      const { data } = await api.put(`/tickets/${id}`, { [field]: value });
      setTicket(data);
      toast.success("Ticket actualizado");
    } catch (error) {
      toast.error("No se pudo actualizar");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 2. ENVIAR CALIFICACIÓN ---
  const submitRating = async () => {
    if (rating === 0) return toast.error("Selecciona al menos una estrella");
    try {
        const { data } = await api.put(`/tickets/${id}`, { 
            rating, 
            feedback,
            status: "CERRADO"
        });
        setTicket(data);
        toast.success("¡Gracias por calificar!");
    } catch (error) {
        toast.error("Error al enviar calificación");
    }
  };

  // --- 3. ENVIAR COMENTARIO (Con soporte para Notas Internas) ---
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post("/comments", { 
        ticketId: id, 
        content: newComment,
        isInternal // <--- Enviamos el estado del checkbox
      });
      
      const visualComment = { ...data, author: data.author || user };
      setComments([...comments, visualComment]);
      setNewComment("");
      setIsInternal(false); // Reseteamos el checkbox
      toast.success("Respuesta enviada");
    } catch (error) {
      toast.error("Error al enviar");
    }
  };

  // --- 4. ELIMINAR TICKET ---
  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este ticket? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/tickets/${id}`);
      toast.success("Ticket eliminado correctamente");
      if (user.role === "ADMIN") navigate("/mis-casos"); 
      else navigate("/mis-tickets");
    } catch (error) {
      toast.error("Error al eliminar el ticket");
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando...</div>;
  if (!ticket) return <div className="p-5 text-center">Ticket no encontrado</div>;

  const isAdmin = user.role === "ADMIN" || user.role === "SUPPORT";
  const canRate = user.role === "CLIENT" && (ticket.status === "RESUELTO" || ticket.status === "CERRADO") && ticket.rating === 0;

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>
      <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none ps-0 mb-3">
        <i className="bi bi-arrow-left"></i> Volver
      </button>

      <div className="row g-4">
        {/* IZQUIERDA */}
        <div className="col-lg-8">
          
          {/* TARJETA PRINCIPAL */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold mb-0">{ticket.title}</h2>
                <span className={`badge ${ticket.status === 'ABIERTO' ? 'bg-success' : 'bg-secondary'}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="bg-light p-3 rounded border mb-3">
                <h6 className="fw-bold text-secondary small">DESCRIPCIÓN</h6>
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
              </div>
            </div>
          </div>

          {/* === ZONA DE CALIFICACIÓN === */}
          {canRate && (
            <div className="card shadow-sm border-0 mb-4 border-warning">
                <div className="card-body text-center bg-white">
                    <h5 className="fw-bold text-dark">¿Cómo calificarías la atención?</h5>
                    <div className="mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className={`bi ${star <= (hoverRating || rating) ? "bi-star-fill text-warning" : "bi-star text-secondary"} mx-1`} style={{ fontSize: "2rem", cursor: "pointer" }} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)}></i>
                        ))}
                    </div>
                    <textarea className="form-control mb-3" placeholder="Comentario opcional..." value={feedback} onChange={(e) => setFeedback(e.target.value)}></textarea>
                    <button onClick={submitRating} className="btn btn-warning fw-bold text-dark px-4">Enviar Calificación</button>
                </div>
            </div>
          )}

          {ticket.rating > 0 && (
             <div className="card shadow-sm border-0 mb-4 bg-success text-white">
                <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                        <h6 className="fw-bold mb-1"><i className="bi bi-award-fill me-2"></i> Feedback del Cliente</h6>
                        <p className="mb-0 fst-italic">"{ticket.feedback || "Sin comentarios"}"</p>
                    </div>
                    <div className="fs-3 text-warning">{"★".repeat(ticket.rating)}</div>
                </div>
             </div>
          )}

          {/* === CHAT / HISTORIAL === */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold"><i className="bi bi-chat-dots"></i> Historial</div>
            
            <div className="card-body bg-light" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {comments
                // FILTRO DE SEGURIDAD VISUAL: Ocultar internos al cliente
                .filter(c => {
                    if (user.role === "CLIENT" && c.isInternal) return false;
                    return true;
                })
                .map((c, i) => (
                <div key={i} className={`d-flex mb-3 ${c.author?._id === user.id ? "justify-content-end" : ""}`}>
                  <div 
                    className={`card px-3 py-2 border-0 shadow-sm ${
                        c.isInternal ? "border border-warning bg-warning-subtle" : // Estilo para notas internas
                        c.author?._id === user.id ? "bg-primary text-white" : "bg-white"
                    }`} 
                    style={{maxWidth:"80%"}}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-2">
                        <small className="fw-bold" style={{fontSize:"0.75rem", opacity: 0.9}}>
                          {c.author?.firstName} {c.isInternal && <span className="badge bg-warning text-dark ms-1" style={{fontSize:"0.6rem"}}>NOTA INTERNA</span>}
                        </small>
                    </div>
                    <p className="mb-0">{c.content || c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="card-footer bg-white p-2">
              <form onSubmit={handleSendComment}>
                {/* CHECKBOX NOTA INTERNA (Solo Admin/Soporte) */}
                {(user.role === "ADMIN" || user.role === "SUPPORT") && (
                    <div className="form-check mb-2">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="internalCheck"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                        />
                        <label className="form-check-label small text-muted" htmlFor="internalCheck">
                            <i className="bi bi-eye-slash-fill me-1"></i> Nota Interna (Invisible para el cliente)
                        </label>
                    </div>
                )}
                
                <div className="input-group">
                    <input className="form-control" placeholder="Escribir respuesta..." value={newComment} onChange={e=>setNewComment(e.target.value)}/>
                    <button className="btn btn-primary"><i className="bi bi-send"></i></button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* DERECHA: PANEL DE CONTROL */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">
              <i className="bi bi-tools me-2"></i> Gestión
            </div>
            <div className="card-body">
              
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">ESTADO</label>
                {isAdmin ? (
                  <select className="form-select" value={ticket.status} disabled={isUpdating} onChange={(e) => handleUpdate("status", e.target.value)}>
                    <option value="ABIERTO">🟢 Abierto</option>
                    <option value="EN_PROCESO">🟡 En Proceso</option>
                    <option value="ESPERANDO_CLIENTE">🔵 Esperando Cliente</option>
                    <option value="RESUELTO">✅ Resuelto</option>
                    <option value="CERRADO">⚫ Cerrado</option>
                  </select>
                ) : (
                  <div className="form-control bg-light">{ticket.status}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">ASIGNADO A</label>
                {isAdmin ? (
                  <select className="form-select" value={ticket.assignedTo?._id || ""} disabled={isUpdating} onChange={(e) => handleUpdate("assignedTo", e.target.value)}>
                    <option value="">-- Sin Asignar --</option>
                    {agents.map(a => (
                      <option key={a._id} value={a._id}>{a.firstName} {a.lastName}</option>
                    ))}
                  </select>
                ) : (
                  <div className="form-control bg-light">
                    {ticket.assignedTo ? ticket.assignedTo.firstName : "Sin asignar"}
                  </div>
                )}
              </div>
              
              <hr />
              <div className="small text-muted mb-3">
                Solicitante: <strong>{ticket.createdBy?.email}</strong>
              </div>

              {/* BOTÓN ELIMINAR (SOLO ADMIN) */}
              {user.role === "ADMIN" && (
                <button onClick={handleDelete} className="btn btn-outline-danger w-100">
                    <i className="bi bi-trash me-2"></i> Eliminar Ticket
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}