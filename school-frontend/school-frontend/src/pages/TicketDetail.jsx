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
  const [updating, setUpdating] = useState(false);

  // 1. Cargar Ticket (Sin cargar agentes para evitar error 404)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/tickets/${id}`);
        setTicket(data);
        setComments(data.comments || []);
      } catch (error) {
        toast.error("Error cargando ticket");
        navigate("/tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // 2. Función para CAMBIAR EL ESTATUS
  const handleChangeStatus = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);

    try {
      // Enviamos solo el estatus nuevo
      const { data } = await api.put(`/tickets/${id}`, { status: newStatus });
      
      // Actualizamos la vista
      setTicket(data);
      toast.success(`Estatus cambiado a: ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el estatus");
    } finally {
      setUpdating(false);
    }
  };

  // Función de Chat
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post("/comments", { ticketId: id, content: newComment });
      const visualComment = { ...data, author: data.author || user };
      setComments([...comments, visualComment]);
      setNewComment("");
      toast.success("Mensaje enviado");
    } catch (error) {
      toast.error("Error al enviar");
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando...</div>;
  if (!ticket) return null;

  const isAdmin = user.role === "ADMIN" || user.role === "SUPPORT";

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>
      
      <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none ps-0 mb-3">
        <i className="bi bi-arrow-left"></i> Volver
      </button>

      <div className="row g-4">
        
        {/* COLUMNA IZQUIERDA: INFO Y CHAT */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h2 className="fw-bold mb-2">{ticket.title}</h2>
              <span className={`badge ${ticket.priority === 'CRITICA' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                Prioridad: {ticket.priority}
              </span>
              <hr />
              <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
            </div>
          </div>

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
                <input className="form-control" placeholder="Respuesta..." value={newComment} onChange={e=>setNewComment(e.target.value)}/>
                <button className="btn btn-primary"><i className="bi bi-send"></i></button>
              </form>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: GESTIÓN (AQUÍ ESTÁ EL CAMBIO) */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">
              <i className="bi bi-gear-fill me-2"></i> Gestión
            </div>
            <div className="card-body">
              
              {/* SELECTOR DE ESTATUS (Solo para Admin/Soporte) */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">ESTADO DEL TICKET</label>
                
                {isAdmin ? (
                  <select 
                    className="form-select form-select-lg fw-bold"
                    value={ticket.status}
                    onChange={handleChangeStatus}
                    disabled={updating}
                    style={{ 
                      borderColor: ticket.status === 'ABIERTO' ? '#198754' : '#6c757d',
                      color: ticket.status === 'ABIERTO' ? '#198754' : '#000'
                    }}
                  >
                    <option value="ABIERTO">🟢 ABIERTO</option>
                    <option value="EN_PROCESO">🟡 EN PROCESO</option>
                    <option value="ESPERANDO_CLIENTE">🔵 ESPERANDO CLIENTE</option>
                    <option value="RESUELTO">✅ RESUELTO</option>
                    <option value="CERRADO">⚫ CERRADO</option>
                  </select>
                ) : (
                  // Si es cliente, solo ve el estado, no lo cambia
                  <div className="badge bg-secondary d-block p-2 fs-6">{ticket.status}</div>
                )}
              </div>

              <hr />
              <div className="small text-muted">
                Solicitado por: <strong>{ticket.createdBy?.email}</strong>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}