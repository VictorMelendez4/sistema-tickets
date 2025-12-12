import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// URL BASE PARA LAS IMÁGENES
//const API_URL = "http://localhost:4000";
//const API_URL = "http://159.54.142.179";
const API_URL = "https://northcode-soporte.duckdns.org";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const [agents, setAgents] = useState([]); 
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

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

        if (user.role !== "CLIENT") {
          const agentsRes = await api.get("/auth/support-agents");
          setAgents(agentsRes.data);
        }
      } catch (error) {
        toast.error("Error cargando información");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

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

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post("/comments", { 
        ticketId: id, 
        content: newComment,
        isInternal 
      });
      
      const visualComment = { ...data, author: data.author || user };
      setComments([...comments, visualComment]);
      setNewComment("");
      setIsInternal(false);
      toast.success("Respuesta enviada");
    } catch (error) {
      toast.error("Error al enviar");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este ticket?")) return;
    try {
      await api.delete(`/tickets/${id}`);
      toast.success("Eliminado");
      navigate(user.role === "CLIENT" ? "/mis-tickets" : "/tickets-global");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando...</div>;
  if (!ticket) return <div className="p-5 text-center">Ticket no encontrado</div>;

  const isAdmin = user.role === "ADMIN" || user.role === "SUPPORT";
  const canRate = user.role === "CLIENT" && (ticket.status === "RESUELTO" || ticket.status === "CERRADO") && ticket.rating === 0;

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>
      <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none ps-0 mb-3 text-white">
        <i className="bi bi-arrow-left"></i> Volver
      </button>

      <div className="row g-4">
        {/* IZQUIERDA: Detalles y Chat */}
        <div className="col-lg-8">
          
          {/* 1. TARJETA PRINCIPAL (DETALLES) */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="fw-bold mb-0 text-dark">{ticket.title}</h2>
                <span className={`badge ${ticket.status === 'ABIERTO' ? 'bg-success' : 'bg-secondary'} fs-6`}>
                  {ticket.status}
                </span>
              </div>
              
              <div className="bg-light p-3 rounded border mb-3">
                <h6 className="fw-bold text-secondary small mb-2">DESCRIPCIÓN DEL PROBLEMA</h6>
                <p className="mb-0 text-dark" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
              </div>

              {/* 👇 2. ZONA DE EVIDENCIA (ARCHIVO ADJUNTO) */}
              {ticket.attachment && (
                <div className="mt-3">
                    <h6 className="fw-bold text-secondary small mb-2"><i className="bi bi-paperclip"></i> ARCHIVO ADJUNTO</h6>
                    {ticket.attachment.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <div className="border rounded p-2 d-inline-block bg-light">
                            <a href={`${API_URL}${ticket.attachment}`} target="_blank" rel="noreferrer">
                                <img 
                                    src={`${API_URL}${ticket.attachment}`} 
                                    alt="Evidencia" 
                                    style={{ maxHeight: "300px", maxWidth: "100%" }} 
                                />
                            </a>
                        </div>
                    ) : (
                        <a href={`${API_URL}${ticket.attachment}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-download me-2"></i> Descargar Archivo
                        </a>
                    )}
                </div>
              )}

            </div>
          </div>

          {/* 3. CALIFICACIÓN (Solo Cliente) */}
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

          {/* 4. CHAT / HISTORIAL */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3"><i className="bi bi-chat-dots me-2"></i> Historial de Comentarios</div>
            
            <div className="card-body bg-light" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {comments
                .filter(c => {
                    if (user.role === "CLIENT" && c.isInternal) return false;
                    return true;
                })
                .map((c, i) => (
                <div key={i} className={`d-flex mb-3 ${c.author?._id === user.id ? "justify-content-end" : ""}`}>
                  <div 
                    className={`card px-3 py-2 border-0 shadow-sm ${
                        c.isInternal ? "border border-warning bg-warning-subtle" : 
                        c.author?._id === user.id ? "bg-primary text-white" : "bg-white"
                    }`} 
                    style={{maxWidth:"85%"}}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                        <small className="fw-bold" style={{fontSize:"0.75rem", opacity: 0.9}}>
                          {c.author?.firstName} {c.isInternal && <span className="badge bg-warning text-dark ms-1" style={{fontSize:"0.6rem"}}>NOTA INTERNA</span>}
                        </small>
                        <small style={{fontSize:"0.65rem", opacity: 0.7}}>
                            {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </small>
                    </div>
                    <p className="mb-0">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-center text-muted small my-3">No hay comentarios aún.</p>}
            </div>
            
            <div className="card-footer bg-white p-3">
              <form onSubmit={handleSendComment}>
                {(user.role !== "CLIENT") && (
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
                    <input className="form-control" placeholder="Escribe una respuesta..." value={newComment} onChange={e=>setNewComment(e.target.value)}/>
                    <button className="btn btn-primary"><i className="bi bi-send-fill"></i></button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* DERECHA: GESTIÓN */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold py-3">
              <i className="bi bi-tools me-2"></i> Gestión del Ticket
            </div>
            <div className="card-body">
              
                {/*  ACCESO RÁPIDO A EVIDENCIA (Solo si existe) */}
              {ticket.attachment && (
                <div className="mb-4 pb-3 border-bottom">
                    <label className="form-label fw-bold small text-muted">EVIDENCIA</label>
                    <a 
                        href={`${API_URL}${ticket.attachment}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-primary w-100 btn-sm"
                    >
                        <i className="bi bi-eye-fill me-2"></i> Ver Archivo Adjunto
                    </a>
                </div>
              )}              

              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">ESTADO ACTUAL</label>
                {isAdmin ? (
                  <select className="form-select" value={ticket.status} disabled={isUpdating} onChange={(e) => handleUpdate("status", e.target.value)}>
                    <option value="ABIERTO">🟢 Abierto</option>
                    <option value="EN_PROCESO">🟡 En Proceso</option>
                    <option value="ESPERANDO_CLIENTE">🔵 Esperando Cliente</option>
                    <option value="RESUELTO">✅ Resuelto</option>
                    <option value="CERRADO">⚫ Cerrado</option>
                  </select>
                ) : (
                  <div className="form-control bg-light text-secondary fw-bold">{ticket.status}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">AGENTE ASIGNADO</label>
                {isAdmin ? (
                  <select className="form-select" value={ticket.assignedTo?._id || ""} disabled={isUpdating} onChange={(e) => handleUpdate("assignedTo", e.target.value)}>
                    <option value="">-- Sin Asignar --</option>
                    {agents.map(a => (
                      <option key={a._id} value={a._id}>{a.firstName} {a.lastName} ({a.department || "General"})</option>
                    ))}
                  </select>
                ) : (
                  <div className="form-control bg-light text-secondary">
                    {ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : "Sin asignar"}
                  </div>
                )}
              </div>
              
              <hr />
              <div className="mb-3">
                 <small className="text-muted d-block">Solicitante:</small>
                 <strong>{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</strong>
                 <br/><small className="text-muted">{ticket.createdBy?.email}</small>
              </div>

              <div className="mb-3">
                 <small className="text-muted d-block">Departamento:</small>
                 <span className="badge bg-light text-dark border">{ticket.department}</span>
              </div>

              <div className="mb-3">
                 <small className="text-muted d-block">Prioridad:</small>
                 <span className={`badge ${ticket.priority === 'CRITICA' ? 'bg-danger' : ticket.priority === 'ALTA' ? 'bg-warning text-dark' : 'bg-success'}`}>
                    {ticket.priority}
                 </span>
              </div>

              {user.role === "ADMIN" && (
                <button onClick={handleDelete} className="btn btn-outline-danger w-100 mt-3">
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