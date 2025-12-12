import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres");
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Las contraseñas no coinciden");

    setLoading(true);
    try {
      // Usamos la ruta que ya existe en el backend: /api/auth/update-password
      // OJO: Hay que asegurar que esta ruta exista en auth.routes.js
      await api.put("/auth/update-password", { newPassword: passwords.newPassword });
      toast.success("Contraseña actualizada correctamente");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Error al actualizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{maxWidth: "600px"}}>
      <h2 className="fw-bold mb-4">Mi Perfil</h2>
      
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
             <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-2" style={{width: 80, height: 80}}>
                {user.firstName.charAt(0)}
             </div>
             <div>
                <h4 className="fw-bold m-0">{user.firstName} {user.lastName}</h4>
                <p className="text-muted m-0">{user.email}</p>
                <span className="badge bg-light text-dark border mt-2">{user.role}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
            <h5 className="m-0 fw-bold"><i className="bi bi-shield-lock me-2"></i> Cambiar Contraseña</h5>
        </div>
        <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nueva Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        value={passwords.newPassword}
                        onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Guardando..." : "Actualizar Contraseña"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}