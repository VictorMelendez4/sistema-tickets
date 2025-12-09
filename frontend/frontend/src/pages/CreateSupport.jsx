import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CreateSupport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "SOPORTE GENERAL",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Llamamos a la ruta protegida
      await api.post("/auth/create-staff", formData);
      toast.success("¡Agente de soporte creado!");
      navigate("/gestion-tickets"); // O redirigir a donde quieras
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.msg || "Error al crear agente";
      toast.error(msg);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white py-3">
          <h4 className="mb-0 fw-bold"><i className="bi bi-person-badge-fill me-2"></i> Alta de Personal</h4>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Nombre</label>
                <input type="text" name="firstName" className="form-control" required onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Apellido</label>
                <input type="text" name="lastName" className="form-control" required onChange={handleChange} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Correo Corporativo</label>
              <input type="email" name="email" className="form-control" required onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Contraseña Temporal</label>
              <input type="password" name="password" className="form-control" required onChange={handleChange} />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Departamento Asignado</label>
              <select name="department" className="form-select" onChange={handleChange}>
                <option value="SOPORTE GENERAL">Soporte General</option>
                <option value="HARDWARE">Hardware (Equipos)</option>
                <option value="SOFTWARE">Software (Sistemas)</option>
                <option value="REDES">Redes y Conectividad</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold py-2">
              Registrar Agente
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}