import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import toast from "react-hot-toast";

export default function TicketForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "HARDWARE", // Default coincidente con Backend
    priority: "MEDIA",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error("Completa los campos obligatorios");
    }

    setLoading(true);
    try {
      await api.post("/tickets", formData);
      toast.success("¡Ticket creado exitosamente!");
      navigate("/mis-tickets"); 
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0 fw-bold"><i className="bi bi-pencil-square me-2"></i> Nuevo Reporte</h4>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            <div className="mb-4">
              <label className="form-label fw-bold text-muted small">ASUNTO</label>
              <input type="text" name="title" className="form-control form-control-lg" required value={formData.title} onChange={handleChange} autoFocus />
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">DEPARTAMENTO / CATEGORÍA</label>
                <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                  <option value="HARDWARE">Hardware (Equipos físicos)</option>
                  <option value="SOFTWARE">Software (Programas)</option>
                  <option value="REDES">Redes e Internet</option>
                  <option value="SOPORTE GENERAL">Soporte General / Otros</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">PRIORIDAD</label>
                <select name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
                  <option value="BAJA">🟢 Baja</option>
                  <option value="MEDIA">🟡 Media</option>
                  <option value="ALTA">🟠 Alta</option>
                  <option value="CRITICA">🔴 Crítica</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-muted small">DESCRIPCIÓN</label>
              <textarea name="description" className="form-control" rows="5" required value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button type="button" onClick={() => navigate("/")} className="btn btn-outline-secondary px-4">Cancelar</button>
              <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={loading}>{loading ? "Enviando..." : "Enviar Ticket"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}