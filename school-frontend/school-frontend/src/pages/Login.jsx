import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Ejecutamos el login del contexto
      await login(email, password);
      
      // 2. Verificamos si se guardó el usuario
      const userStored = JSON.parse(localStorage.getItem("user"));
      
      if (userStored) {
        // CAMBIO IMPORTANTE: 
        // En el sistema de tickets, TODOS van al Dashboard principal ("/")
        // El Dashboard se encargará de mostrar "Crear Ticket" o "Bandeja" según el rol.
        navigate("/"); 
      }

    } catch (error) {
      console.error(error);
      alert("Credenciales incorrectas o error de conexión");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 bg-white">
      <div className="row g-0 flex-fill">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <div className="col-lg-6 d-flex flex-column justify-content-center px-5 py-5">
          <div className="mx-auto w-100" style={{ maxWidth: "420px" }}>
            
            {/* Logo y Marca */}
            <div className="d-flex align-items-center gap-2 mb-5">
              <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                {/* Ícono de soporte técnico (Headset) */}
                <i className="bi bi-headset text-white fs-4"></i>
              </div>
              <span className="fs-4 fw-bold text-dark tracking-tight">HelpDesk Pro</span>
            </div>

            <div className="mb-4">
              <h2 className="fw-bold display-6 mb-2">Portal de Soporte</h2>
              <p className="text-muted">Inicia sesión para gestionar tus tickets.</p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text bg-white py-3 ps-3">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control py-3"
                    placeholder="usuario@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Contraseña</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-white py-3 ps-3">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control py-3"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 fs-5 fw-bold shadow-sm">
                Entrar al Sistema <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-muted">
                ¿Necesitas ayuda y no tienes cuenta?{" "}
                {/* Nota: Asegúrate de crear una página de registro si la necesitas, o borra esto */}
                <Link to="/registro" className="text-primary fw-bold text-decoration-none">
                  Regístrate como Cliente
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* === COLUMNA DERECHA: IMAGEN TÉCNICA === */}
        <div className="col-lg-6 d-none d-lg-block auth-bg-image" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop')" }}>
          <div className="auth-overlay"></div>
          <div className="position-absolute bottom-0 start-0 p-5 text-white">
            <h3 className="display-6 fw-bold mb-3">Soporte técnico eficiente.</h3>
            <p className="fs-5 opacity-75" style={{maxWidth: '500px'}}>
              Reporta incidencias, rastrea el estado de tus casos y recibe soluciones rápidas de nuestro equipo de expertos.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}