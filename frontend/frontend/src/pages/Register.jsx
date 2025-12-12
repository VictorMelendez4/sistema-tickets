import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  // Aunque no usamos setAuthData aquí para evitar conflictos,
  // el hook puede ser útil en el futuro.
  const { setAuthData } = useAuth(); 

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Petición al backend
      // El backend ya establece la Cookie automáticamente aquí.
      await api.post("/auth/register", formData);
      
      // 2. ÉXITO (Si llegamos aquí, es que funcionó)
      // No necesitamos verificar "data.token" porque viene en la cookie.
      
      toast.success("¡Cuenta creada exitosamente!");
      
      // 3. Redirección
      // Te mandamos al Login para asegurar que el contexto cargue bien la cookie
      navigate("/login");
      
    } catch (error) {
      console.error("Error registro:", error);
      
      // 4. MANEJO DE ERRORES INTELIGENTE
      // Detecta si el error es un Texto simple o una Lista de errores
      const errorData = error.response?.data;
      
      if (Array.isArray(errorData)) {
        // Si el backend manda una lista (ej: ["El email ya existe"]), mostramos el primero
        toast.error(errorData[0]);
      } else if (errorData?.message) {
        // Si es un objeto { message: "..." }
        toast.error(errorData.message);
      } else {
        // Error genérico
        toast.error("Error al registrarse. Verifique sus datos.");
      }
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 bg-white">
      <div className="row g-0 flex-fill">
        {/* IZQUIERDA: IMAGEN (Estilo Visual Mejorado) */}
        <div className="col-lg-5 d-none d-lg-block auth-bg-image" 
             style={{ 
               backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')",
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               position: 'relative'
             }}>
             <div className="auth-overlay" style={{
                 position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                 backgroundColor: 'rgba(15, 44, 89, 0.4)' // Filtro azul corporativo
             }}></div>
             <div className="position-absolute bottom-0 start-0 p-5 text-white z-1">
                 <h2 className="fw-bold">Únete a North Code</h2>
                 <p className="lead opacity-75">Gestión de soporte eficiente y moderna.</p>
             </div>
        </div>

        {/* DERECHA: FORMULARIO */}
        <div className="col-lg-7 d-flex flex-column justify-content-center px-5 py-5">
          <div className="mx-auto w-100" style={{ maxWidth: "500px" }}>
            
            <div className="mb-5">
               <h2 className="fw-bold display-6 mb-2 text-dark">Crear Cuenta</h2>
               <p className="text-muted">Ingresa tus datos para comenzar.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>NOMBRE</label>
                  <input type="text" name="firstName" className="form-control py-3 bg-light border-0" placeholder="Ej: Juan" required onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>APELLIDO</label>
                  <input type="text" name="lastName" className="form-control py-3 bg-light border-0" placeholder="Ej: Pérez" required onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>CORREO ELECTRÓNICO</label>
                <input type="email" name="email" className="form-control py-3 bg-light border-0" placeholder="nombre@ejemplo.com" required onChange={handleChange} />
              </div>

              <div className="mb-5">
                <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>CONTRASEÑA</label>
                <input type="password" name="password" className="form-control py-3 bg-light border-0" placeholder="••••••••" required onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-lg rounded-3" style={{letterSpacing: '1px'}}>
                REGISTRARME
              </button>
            </form>

            <div className="mt-5 text-center pt-4 border-top">
              <p className="text-muted mb-0">
                ¿Ya tienes una cuenta? <Link to="/login" className="text-primary fw-bold text-decoration-none">Inicia Sesión aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}