import { useState } from "react";
import { api } from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CreateSupport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "SUPPORT", // Valor por defecto
    department: "SOPORTE GENERAL" // Valor por defecto
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos los datos al endpoint especial de creación de staff
      await api.post("/auth/create-staff", formData);
      toast.success("Personal creado exitosamente");
      navigate("/usuarios"); // Redirigir a la lista de usuarios
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Error al crear personal");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white fw-bold">
          <i className="bi bi-person-badge-fill me-2"></i> Alta de Nuevo Personal
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small">Nombre</label>
                <input required name="firstName" className="form-control" onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small">Apellido</label>
                <input required name="lastName" className="form-control" onChange={handleChange} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small">Correo Institucional</label>
              <input required type="email" name="email" className="form-control" onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small">Contraseña Temporal</label>
              <input required type="password" name="password" className="form-control" minLength="6" onChange={handleChange} />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small">Rol en el Sistema</label>
                <select name="role" className="form-select" onChange={handleChange} value={formData.role}>
                  <option value="SUPPORT">Agente de Soporte</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small">Departamento</label>
                <select name="department" className="form-select" onChange={handleChange} value={formData.department}>
                  <option value="SOPORTE GENERAL">Soporte General</option>
                  <option value="REDES">Redes y Conectividad</option>
                  <option value="HARDWARE">Hardware y Mantenimiento</option>
                  <option value="SOFTWARE">Software y Licencias</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary w-100 fw-bold mt-3">
              <i className="bi bi-save me-2"></i> Registrar Empleado
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}