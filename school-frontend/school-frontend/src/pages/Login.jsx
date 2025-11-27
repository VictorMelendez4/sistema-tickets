import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Agregué Link aquí
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
      // AQUI ESTABA EL ERROR: Antes hacíamos api.post manual.
      // AHORA: Usamos directamente la función del contexto.
      await login(email, password); 
      
      // La redirección la decidimos basándonos en el rol del usuario que acabamos de loguear.
      // Pero como 'login' es async, el estado 'usuario' puede tardar unos ms en actualizarse.
      // Para redireccionar rápido, podemos decodificar o confiar en el backend, 
      // pero lo más seguro es dejar que el usuario navegue o forzar la redirección aquí:
      
      // Truco: Leemos el user recién guardado en localStorage para decidir a dónde ir
      const userStored = JSON.parse(localStorage.getItem("user"));
      if (userStored) {
        navigate(userStored.role === "ADMIN" ? "/" : "/panel-docente");
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
            
            {/* Logo */}
            <div className="d-flex align-items-center gap-2 mb-5">
              <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                <i className="bi bi-mortarboard-fill text-white fs-4"></i>
              </div>
              <span className="fs-4 fw-bold text-dark tracking-tight">EduManager</span>
            </div>

            <div className="mb-4">
              <h2 className="fw-bold display-6 mb-2">Bienvenido de nuevo</h2>
              <p className="text-muted">Ingresa tus datos para acceder al panel de control.</p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Correo Institucional</label>
                <div className="input-group">
                  <span className="input-group-text bg-white py-3 ps-3">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control py-3"
                    placeholder="nombre@escuela.edu"
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
                  <a href="#" className="text-decoration-none small text-primary fw-bold">¿Olvidaste tu contraseña?</a>
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
                Iniciar Sesión <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-muted">
                ¿Eres docente y no tienes cuenta?{" "}
                <Link to="/register-teacher" className="text-primary fw-bold text-decoration-none">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* === COLUMNA DERECHA: IMAGEN === */}
        {/* Se oculta en móviles (d-none d-lg-block) */}
        <div className="col-lg-6 d-none d-lg-block auth-bg-image" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')" }}>
          <div className="auth-overlay"></div>
          <div className="position-absolute bottom-0 start-0 p-5 text-white">
            <h3 className="display-6 fw-bold mb-3">Gestión académica simplificada.</h3>
            <p className="fs-5 opacity-75" style={{maxWidth: '500px'}}>
              Optimiza tiempos, gestiona calificaciones y mantén el control de tus grupos en una sola plataforma intuitiva.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}