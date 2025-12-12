import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import toast from "react-hot-toast"; // Librería de notificaciones

export default function TicketForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("SOPORTE GENERAL");
  const [priority, setPriority] = useState("BAJA");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("department", department);
      formData.append("priority", priority);
      
      if (file) {
        formData.append("file", file);
      }

      await api.post("/tickets", formData);
      
      // NOTIFICACIÓN MEJORADA
      toast.success("¡Reporte enviado! El equipo ha sido notificado.", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        duration: 4000
      });
      
      navigate("/mis-tickets");
    } catch (error) {
      // NOTIFICACIÓN DE ERROR
      toast.error("No se pudo enviar el reporte. Intenta de nuevo.", {
        style: { borderRadius: '10px', background: '#fff0f0', color: '#d00' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{maxWidth: "700px"}}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-bold">
            <i className="bi bi-plus-circle me-2"></i> Nuevo Reporte
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Asunto</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: No tengo internet" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Departamento</label>
                    <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="SOPORTE GENERAL">Soporte General</option>
                        <option value="REDES">Redes e Internet</option>
                        <option value="HARDWARE">Hardware (Equipos)</option>
                        <option value="SOFTWARE">Software (Programas)</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Prioridad</label>
                    <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="BAJA">🟢 Baja</option>
                        <option value="MEDIA">🟡 Media</option>
                        <option value="ALTA">🟠 Alta</option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Descripción Detallada</label>
              <textarea 
                className="form-control" 
                rows="4" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required
              ></textarea>
            </div>

            <div className="mb-4">
                <label className="form-label fw-bold">Evidencia (Opcional)</label>
                <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*, .pdf" 
                    onChange={(e) => setFile(e.target.files[0])} 
                />
                <div className="form-text">Puedes subir capturas de pantalla o fotos del error.</div>
            </div>

            <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary fw-bold" disabled={loading}>
                    {loading ? "Enviando..." : "Crear Ticket"}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}