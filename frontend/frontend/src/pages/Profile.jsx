import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("La contraseña debe tener mínimo 6 caracteres");
    
    try {
      setLoading(true);
      await api.put("/auth/profile/password", { newPassword: password });
      toast.success("¡Contraseña actualizada! Úsala en tu próximo inicio de sesión.");
      setPassword(""); // Limpiar campo
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "800px" }}>
      <h2 className="fw-bold mb-4"><i className="bi bi-person-circle me-2"></i> Mi Perfil</h2>
      
      <div className="row g-4">
        {/* TARJETA DE DATOS */}
        <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white fw-bold">Datos Personales</div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="small text-muted fw-bold">NOMBRE COMPLETO</label>
                        <p className="fs-5 mb-0">{user.firstName} {user.lastName}</p>
                    </div>
                    <div className="mb-3">
                        <label className="small text-muted fw-bold">CORREO ELECTRÓNICO</label>
                        <p className="fs-5 mb-0">{user.email}</p>
                    </div>
                    <div>
                        <label className="small text-muted fw-bold">ROL DEL SISTEMA</label>
                        <div>
                            <span className={`badge ${
                                user.role === "ADMIN" ? "bg-danger" : 
                                user.role === "SUPPORT" ? "bg-primary" : "bg-success"
                            }`}>
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* TARJETA DE CAMBIO DE PASSWORD */}
        <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100 border-start border-4 border-warning">
                <div className="card-body">
                    <h5 className="fw-bold mb-3"><i className="bi bi-key-fill text-warning me-2"></i> Seguridad</h5>
                    <p className="small text-muted">
                        Si te asignaron una contraseña temporal o crees que tu cuenta está en riesgo, actualízala aquí.
                    </p>
                    
                    <form onSubmit={handleUpdate}>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">NUEVA CONTRASEÑA</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Escribe tu nueva clave..."
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button disabled={loading} className="btn btn-dark w-100">
                            {loading ? "Actualizando..." : "Actualizar Contraseña"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}