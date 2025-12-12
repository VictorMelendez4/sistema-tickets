import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  
  // Estado para estadísticas personales
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    // Si es soporte o admin, cargamos sus estadísticas
    if (["ADMIN", "SUPPORT"].includes(user.role)) {
        api.get("/users/profile/stats") // 👇 Llamamos a la nueva ruta
           .then(res => setMyStats(res.data))
           .catch(err => console.error("Error cargando stats perfil", err));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) return toast.error("Mínimo 6 caracteres");
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("No coinciden");

    setLoading(true);
    try {
      await api.put("/auth/update-password", { newPassword: passwords.newPassword });
      toast.success("Contraseña actualizada");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{maxWidth: "800px"}}>
      <h2 className="fw-bold mb-4">Mi Perfil</h2>
      
      <div className="row g-4 mb-4">
        {/* TARJETA DE USUARIO */}
        <div className="col-md-12">
            <div className="card shadow-sm border-0">
                <div className="card-body p-4 d-flex align-items-center gap-4">
                     <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center display-4 fw-bold" style={{width: 100, height: 100}}>
                        {user.firstName?.charAt(0)}
                     </div>
                     <div>
                        <h3 className="fw-bold m-0">{user.firstName} {user.lastName}</h3>
                        <p className="text-muted m-0">{user.email}</p>
                        <div className="mt-2">
                             <span className="badge bg-dark me-2">{user.role}</span>
                             {user.department && <span className="badge bg-light text-dark border">{user.department}</span>}
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* 👇 ESTADÍSTICAS PERSONALES (SOLO SOPORTE) */}
        {myStats && (
            <div className="col-md-12">
                <div className="row g-3">
                    <div className="col-4">
                        <div className="card border-0 shadow-sm bg-success bg-opacity-10 text-success text-center py-3">
                            <h3 className="fw-bold m-0">{myStats.solved}</h3>
                            <small>Resueltos</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 shadow-sm bg-warning bg-opacity-10 text-dark text-center py-3">
                            <h3 className="fw-bold m-0">{myStats.pending}</h3>
                            <small>Pendientes</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 shadow-sm bg-primary bg-opacity-10 text-primary text-center py-3">
                            <h3 className="fw-bold m-0">{myStats.rating} ★</h3>
                            <small>Calificación</small>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* CAMBIO DE CONTRASEÑA */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
            <h5 className="m-0 fw-bold"><i className="bi bi-shield-lock me-2"></i> Seguridad</h5>
        </div>
        <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Nueva Contraseña</label>
                        <input type="password" className="form-control" 
                            value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                         <label className="form-label">Confirmar Contraseña</label>
                        <input type="password" className="form-control" 
                            value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} required />
                    </div>
                </div>
                <button type="submit" className="btn btn-dark" disabled={loading}>
                    {loading ? "Guardando..." : "Actualizar Contraseña"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}