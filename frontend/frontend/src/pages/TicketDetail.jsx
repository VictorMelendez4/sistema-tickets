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
        
        // Cargar calificación si ya existe
        if (data.rating) {
            setRating(data.rating);
            setFeedback(data.feedback);
        }

        // Si es Staff, cargar lista de agentes
        if (user.role === "ADMIN" || user.role === "SUPPORT") {
          const agentsRes = await api.get("/auth/support-agents");
          setAgents(agentsRes.data);
        }
      } catch (error) {
        toast.error("Error cargando información");
        // 🛡️ PROTECCIÓN CONTRA BUCLE INFINITO:
        // No redirigimos automáticamente si falla, solo quitamos el loading.
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, user]);

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

  // ENVIAR CALIFICACIÓN
  const submitRating = async () => {
    if (rating === 0) return toast.error("Selecciona al menos una estrella");
    try {
        const { data } = await api.put(`/tickets/${id}`, { 
            rating, 
            feedback,
            status: "CERRADO" // Opcional: Cerrar definitivamente al calificar
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
      const { data } = await api.post("/comments", { ticketId: id, content: newComment });
      const visualComment = { ...data, author: data.author || user };
      setComments([...comments, visualComment]);
      setNewComment("");
      toast.success("Respuesta enviada");
    } catch (error) {
      toast.error("Error al enviar");
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando...</div>;
  if (!ticket) return <div className="p-5 text-center">Ticket no encontrado</div>;

  const isAdmin = user.role === "ADMIN" || user.role === "SUPPORT";
  // Mostrar votar SI: Es Cliente + Resuelto/Cerrado + No ha votado
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

          {/* === ZONA DE ESTRELLAS === */}
          
          {/* 1. Formulario para Votar (Solo Cliente) */}
          {canRate && (
            <div className="card shadow-sm border-0 mb-4 border-warning">
                <div className="card-body text-center bg-white">
                    <h5 className="fw-bold text-dark">¿Cómo calificarías la atención?</h5>
                    <p className="text-muted small">Tu opinión es importante para nosotros.</p>
                    
                    <div className="mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i 
                                key={star}
                                className={`bi ${star <= (hoverRating || rating) ? "bi-star-fill text-warning" : "bi-star text-secondary"} mx-1`}
                                style={{ fontSize: "2rem", cursor: "pointer" }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            ></i>
                        ))}
                    </div>
                    
                    <textarea 
                        className="form-control mb-3" 
                        placeholder="Comentario opcional..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                    
                    <button onClick={submitRating} className="btn btn-warning fw-bold text-dark px-4">
                        Enviar Calificación
                    </button>
                </div>
            </div>
          )}

          {/* 2. Resultado (Visible si ya votaron) */}
          {ticket.rating > 0 && (
             <div className="card shadow-sm border-0 mb-4 bg-success text-white">
                <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                        <h6 className="fw-bold mb-1"><i className="bi bi-award-fill me-2"></i> Feedback del Cliente</h6>
                        <p className="mb-0 fst-italic">"{ticket.feedback || "Sin comentarios"}"</p>
                    </div>
                    <div className="fs-3 text-warning">
                        {"★".repeat(ticket.rating)}
                    </div>
                </div>
             </div>
          )}

          {/* CHAT */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold"><i className="bi bi-chat-dots"></i> Historial</div>
            <div className="card-body bg-light" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {comments.map((c, i) => (
                <div key={i} className={`d-flex mb-3 ${c.author?._id === user.id ? "justify-content-end" : ""}`}>
                  <div className={`card px-3 py-2 border-0 shadow-sm ${c.author?._id === user.id ? "bg-primary text-white" : "bg-white"}`} style={{maxWidth:"80%"}}>
                    <small className="fw-bold d-block" style={{fontSize:"0.75rem", opacity: 0.9}}>
                      {c.author?.firstName}
                    </small>
                    <p className="mb-0">{c.content || c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="card-footer bg-white p-2">
              <form onSubmit={handleSendComment} className="input-group">
                <input className="form-control" placeholder="Escribir respuesta..." value={newComment} onChange={e=>setNewComment(e.target.value)}/>
                <button className="btn btn-primary"><i className="bi bi-send"></i></button>
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
                  <select 
                    className="form-select"
                    value={ticket.status}
                    disabled={isUpdating}
                    onChange={(e) => handleUpdate("status", e.target.value)}
                  >
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
                  <select 
                    className="form-select"
                    value={ticket.assignedTo?._id || ""}
                    disabled={isUpdating}
                    onChange={(e) => handleUpdate("assignedTo", e.target.value)}
                  >
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
              <div className="small text-muted">
                Solicitante: <strong>{ticket.createdBy?.email}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}