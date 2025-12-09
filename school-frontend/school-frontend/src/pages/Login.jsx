import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast'; // Notificaciones bonitas

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Activamos estado de carga

    try {
      // 1. Intentamos loguear
      await login(email, password);
      
      // 2. Verificamos si se guardó correctamente
      const userStored = JSON.parse(localStorage.getItem("user"));
      
      if (userStored) {
        toast.success(`¡Bienvenido, ${userStored.firstName}!`);
        navigate("/"); // Todos van al Dashboard, el menú se encarga del resto
      }

    } catch (error) {
      console.error(error);
      // Mensaje de error personalizado según lo que responda el servidor
      const msg = error.response?.data?.message || "Credenciales incorrectas";
      toast.error(msg);
    } finally {
      setLoading(false); // Desactivamos carga
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 bg-white">
      <div className="row g-0 flex-fill">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <div className="col-lg-6 d-flex flex-column justify-content-center px-5 py-5">
          <div className="mx-auto w-100" style={{ maxWidth: "420px" }}>
            
            {/* Logo / Marca */}
            <div className="d-flex align-items-center gap-2 mb-5">
              <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{width: 40, height: 40}}>
                <i className="bi bi-headset text-white fs-4"></i>
              </div>
              <span className="fs-4 fw-bold text-dark tracking-tight">HelpDesk Pro</span>
            </div>

            <div className="mb-4">
              <h2 className="fw-bold display-6 mb-2">¡Hola de nuevo!</h2>
              <p className="text-muted">
                Bienvenido al portal de soporte. Ingresa tus credenciales para continuar.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>
                  Correo Electrónico
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0 py-3 ps-2"
                    placeholder="usuario@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>
                    Contraseña
                  </label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-light border-start-0 py-3 ps-2"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Botón Submit */}
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 fs-5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Entrando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Link a Registro */}
            <div className="mt-5 text-center pt-4 border-top">
              <p className="text-muted mb-0">
                ¿Eres nuevo aquí?{" "}
                <Link to="/registro" className="text-primary fw-bold text-decoration-none hover-underline">
                  Crea una cuenta de Cliente
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* === COLUMNA DERECHA: IMAGEN === */}
        <div className="col-lg-6 d-none d-lg-block position-relative p-0">
          <div 
            className="h-100 w-100"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay Gradiente para que el texto resalte */}
            <div className="position-absolute top-0 start-0 w-100 h-100" 
                 style={{background: 'linear-gradient(to bottom, rgba(79, 70, 229, 0.2), rgba(17, 24, 39, 0.8))'}}>
            </div>
            
            {/* Texto sobre la imagen */}
            <div className="position-absolute bottom-0 start-0 p-5 text-white" style={{maxWidth: '600px'}}>
              <div className="mb-3">
                <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold text-uppercase ls-1">
                  Soporte 24/7
                </span>
              </div>
              <h1 className="display-5 fw-bold mb-3">Tu tranquilidad es nuestra prioridad.</h1>
              <p className="fs-5 opacity-75">
                Gestiona incidentes, solicita ayuda técnica y mantén la operatividad de tu empresa sin interrupciones.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}