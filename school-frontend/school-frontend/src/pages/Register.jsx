import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext"; // 👈 Solo importamos el hook
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  
  // 👇 Usamos el hook para sacar la función setAuthData
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
      const { data } = await api.post("/auth/register", formData);
      
      // 2. Si sale bien, iniciamos sesión automático
      if (data.token) {
        // Usamos la función que nos dio el hook useAuth()
        setAuthData(data.user, data.token);
        
        toast.success("¡Cuenta creada! Bienvenido.");
        navigate("/"); // Vamos al Dashboard
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.msg || "Error al registrarse";
      toast.error(msg);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 bg-white">
      <div className="row g-0 flex-fill">
        {/* IZQUIERDA: IMAGEN */}
        <div className="col-lg-5 d-none d-lg-block auth-bg-image" 
             style={{ 
               backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')",
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}>
             <div className="auth-overlay" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}></div>
        </div>

        {/* DERECHA: FORMULARIO */}
        <div className="col-lg-7 d-flex flex-column justify-content-center px-5 py-5">
          <div className="mx-auto w-100" style={{ maxWidth: "500px" }}>
            
            <div className="mb-4">
               <h2 className="fw-bold display-6 mb-2">Crear Cuenta</h2>
               <p className="text-muted">Regístrate para enviar tickets de soporte.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>NOMBRE</label>
                  <input type="text" name="firstName" className="form-control py-2" required onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>APELLIDO</label>
                  <input type="text" name="lastName" className="form-control py-2" required onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>CORREO</label>
                <input type="email" name="email" className="form-control py-2" required onChange={handleChange} />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted" style={{fontSize: '0.75rem'}}>CONTRASEÑA</label>
                <input type="password" name="password" className="form-control py-2" required onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm">
                Registrarse
              </button>
            </form>

            <div className="mt-4 text-center border-top pt-4">
              <p className="text-muted">
                ¿Ya tienes cuenta? <Link to="/login" className="text-primary fw-bold text-decoration-none">Inicia Sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}