import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function RegisterTeacher() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialty: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // Asegúrate de importar setAuthData del contexto:
  const { setAuthData } = useContext(AuthContext); // <--- CAMBIO AQUÍ

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Registramos al usuario (esto crea el usuario en DB)
      const { data } = await api.post("/auth/register-teacher", {
        ...formData,
        specialty: formData.specialty ? [formData.specialty] : [],
      });

      // 2. AUTO-LOGIN MANUAL
      // El backend de registro ya nos devolvió { user, token }.
      // Usamos setAuthData para guardarlos sin llamar a /auth/login de nuevo.
      if (data.token) {
        setAuthData(data.user, data.token); // <--- CAMBIO AQUÍ
        navigate("/panel-docente");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error en el registro.");
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="container-fluid min-vh-100 d-flex p-0 bg-white">
      <div className="row g-0 flex-fill">
        
        {/* === COLUMNA DERECHA: IMAGEN (Invertimos el orden visualmente si quieres, o mantenemos igual) === */}
        {/* Aquí la ponemos a la izquierda para variar respecto al login */}
        <div className="col-lg-5 d-none d-lg-block auth-bg-image" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')" }}>
           <div className="auth-overlay" style={{background: 'linear-gradient(to top, rgba(79, 70, 229, 0.9), rgba(79, 70, 229, 0.2))'}}></div>
           <div className="position-absolute top-0 start-0 p-5 text-white">
             <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-mortarboard-fill fs-3"></i>
                <span className="fs-4 fw-bold tracking-tight">EduManager</span>
              </div>
           </div>
           <div className="position-absolute bottom-0 start-0 p-5 text-white">
             <blockquote className="blockquote">
               <p className="mb-3">"La educación es el arma más poderosa que puedes usar para cambiar el mundo."</p>
               <footer className="blockquote-footer text-white opacity-75">Nelson Mandela</footer>
             </blockquote>
           </div>
        </div>

        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <div className="col-lg-7 d-flex flex-column justify-content-center px-5 py-5">
          <div className="mx-auto w-100" style={{ maxWidth: "600px" }}>
            
            <h2 className="fw-bold display-6 mb-2">Crear cuenta docente</h2>
            <p className="text-muted mb-4">Únete a la plataforma y comienza a gestionar tus clases hoy mismo.</p>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Nombre</label>
                  <input type="text" name="firstName" className="form-control py-3" placeholder="Ej. Ana" required onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Apellido</label>
                  <input type="text" name="lastName" className="form-control py-3" placeholder="Ej. García" required onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Correo Institucional</label>
                <div className="input-group">
                  <span className="input-group-text bg-white py-3 ps-3"><i className="bi bi-envelope"></i></span>
                  <input type="email" name="email" className="form-control py-3" placeholder="ana.garcia@escuela.edu" required onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text bg-white py-3 ps-3"><i className="bi bi-lock"></i></span>
                  <input type="password" name="password" className="form-control py-3" placeholder="Mínimo 6 caracteres" required onChange={handleChange} />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Teléfono (Opcional)</label>
                  <input type="tel" name="phone" className="form-control py-3" placeholder="55 1234 5678" onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted" style={{fontSize: '0.75rem'}}>Especialidad</label>
                  <input type="text" name="specialty" className="form-control py-3" placeholder="Ej. Historia" onChange={handleChange} />
                </div>
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary py-3 fs-5 fw-bold shadow-sm" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Registrarse y Acceder"}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center border-top pt-4">
              <p className="text-muted">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="text-primary fw-bold text-decoration-none">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}