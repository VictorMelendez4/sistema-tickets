import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function TicketForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "HARDWARE", // Valor por defecto
    priority: "MEDIA",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tickets", formData);
      alert("Ticket creado exitosamente");
      navigate("/mis-tickets");
    } catch (error) {
      alert("Error creando ticket");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <h4 className="mb-0">📝 Nuevo Ticket de Soporte</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Asunto</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Mi computadora no enciende"
                required
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción Detallada</label>
              <textarea
                className="form-control"
                rows="4"
                required
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Categoría</label>
                <select 
                  className="form-select"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="HARDWARE">Hardware (Equipo físico)</option>
                  <option value="SOFTWARE">Software (Programas)</option>
                  <option value="REDES">Redes / Internet</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Prioridad</label>
                <select 
                  className="form-select"
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">Enviar Ticket</button>
          </form>
        </div>
      </div>
    </div>
  );
}