import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios"; // Tu instancia de axios configurada
import toast from "react-hot-toast"; // Las notificaciones bonitas

export default function TicketForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "HARDWARE", // Valor por defecto igual al del Backend
    priority: "MEDIA",    // Valor por defecto
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica visual
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error("Por favor completa los campos obligatorios");
    }

    setLoading(true);
    try {
      // Enviamos los datos al endpoint POST /api/tickets
      await api.post("/tickets", formData);
      
      toast.success("¡Ticket creado exitosamente!");
      // Redirigir a la lista de tickets o al dashboard
      navigate("/mis-tickets"); 
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el ticket. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-pencil-square me-2"></i> Nuevo Reporte
          </h4>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            {/* Título */}
            <div className="mb-4">
              <label className="form-label fw-bold text-muted small">ASUNTO</label>
              <input
                type="text"
                name="title"
                className="form-control form-control-lg"
                placeholder="Ej: Mi pantalla no enciende"
                autoFocus
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="row mb-4">
              {/* Categoría */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">CATEGORÍA</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="HARDWARE">Hardware (Equipo físico)</option>
                  <option value="SOFTWARE">Software (Programas)</option>
                  <option value="REDES">Redes / Internet</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>

              {/* Prioridad */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">PRIORIDAD</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="BAJA">🟢 Baja (Consulta general)</option>
                  <option value="MEDIA">🟡 Media (Incidencia normal)</option>
                  <option value="ALTA">🟠 Alta (Urgente)</option>
                  <option value="CRITICA">🔴 Crítica (Sistema caído)</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <label className="form-label fw-bold text-muted small">DESCRIPCIÓN DETALLADA</label>
              <textarea
                name="description"
                className="form-control"
                rows="5"
                placeholder="Describe el problema con el mayor detalle posible..."
                required
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Botones */}
            <div className="d-flex gap-2 justify-content-end">
              <button 
                type="button" 
                onClick={() => navigate("/")} 
                className="btn btn-outline-secondary px-4"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-5 fw-bold"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Ticket"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}