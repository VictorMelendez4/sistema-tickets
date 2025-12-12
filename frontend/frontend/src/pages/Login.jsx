import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast'; // 👈 Importar Toast

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // 👇 NOTIFICACIÓN DE ÉXITO
      toast.success(`¡Bienvenido, ${user.firstName || 'Usuario'}!`, {
        icon: '👋',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      navigate("/"); 

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Credenciales incorrectas";
      
      // 👇 NOTIFICACIÓN DE ERROR
      toast.error(msg, {
        style: { borderRadius: '10px', background: '#fff0f0', color: '#d00' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 bg-white">
      <div className="row g-0 flex-fill">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="col-lg-6 d-flex flex-column justify-content-center px-5 py-5">
          <div className="mx-auto w-100" style={{ maxWidth: "420px" }}>
            
            <div className="d-flex align-items-center gap-2 mb-5">
              <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{width: 40, height: 40}}>
                <i className="bi bi-headset text-white fs-4"></i>
              </div>
              <span className="fs-4 fw-bold text-dark">North Code</span>
            </div>

            <div className="mb-4">
              <h2 className="fw-bold display-6 mb-2">¡Hola de nuevo!</h2>
              <p className="text-muted">Bienvenido al portal de soporte.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">CORREO</label>
                <input
                  type="email"
                  className="form-control bg-light border-0 py-3"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">CONTRASEÑA</label>
                <input
                  type="password"
                  className="form-control bg-light border-0 py-3"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="mt-5 text-center pt-4 border-top">
              <p className="text-muted mb-0">
                ¿Eres nuevo? <Link to="/registro" className="text-primary fw-bold text-decoration-none">Crea una cuenta</Link>
              </p>
            </div>

          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="col-lg-6 d-none d-lg-block position-relative p-0"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
            <div className="position-absolute w-100 h-100" style={{background: 'linear-gradient(to bottom, rgba(79, 70, 229, 0.2), rgba(17, 24, 39, 0.7))'}}></div>
        </div>
      </div>
    </div>
  );
}