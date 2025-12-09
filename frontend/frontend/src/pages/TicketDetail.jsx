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
  
  // ESTADOS NUEVOS PARA ADMIN
  const [agents, setAgents] = useState([]); // Aquí guardaremos la lista de usuarios
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cargar Ticket
        const { data } = await api.get(`/tickets/${id}`);
        setTicket(data);
        setComments(data.comments || []);

        // 2. Si soy Admin o Soporte, cargo la lista de agentes
        if (user.role === "ADMIN" || user.role === "SUPPORT") {
          const agentsRes = await api.get("/auth/support-agents");
          setAgents(agentsRes.data);
        }
      } catch (error) {
        toast.error("Error cargando información");
        navigate("/tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, user]);

  // Función genérica para actualizar (Estado o Asignado)
  const handleUpdate = async (field, value) => {
    setIsUpdating(true);
    try {
      // Enviamos dinámicamente el campo que cambió
      const { data } = await api.put(`/tickets/${id}`, { [field]: value });
      setTicket(data); 
      toast.success("Ticket actualizado correctamente");
    } catch (error) {
      toast.error("No se pudo actualizar");
    } finally {
      setIsUpdating(false);
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
  if (!ticket) return null;

  const isAdmin = user.role === "ADMIN" || user.role === "SUPPORT";

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>
      <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none ps-0 mb-3">
        <i className="bi bi-arrow-left"></i> Volver
      </button>

      <div className="row g-4">
        {/* IZQUIERDA: INFO Y CHAT */}
        <div className="col-lg-8">
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

        {/* DERECHA: GESTIÓN (Solo Admin/Soporte) */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">
              <i className="bi bi-tools me-2"></i> Gestión
            </div>
            <div className="card-body">
              
              {/* CAMBIAR ESTADO */}
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
                    <option value="RESUELTO">✅ Resuelto</option>
                    <option value="CERRADO">⚫ Cerrado</option>
                  </select>
                ) : (
                  <div className="form-control bg-light">{ticket.status}</div>
                )}
              </div>

              {/* CAMBIAR AGENTE (NUEVO) */}
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
                    {/* Aquí pintamos la lista que viene del backend */}
                    {agents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.firstName} {agent.lastName}
                      </option>
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