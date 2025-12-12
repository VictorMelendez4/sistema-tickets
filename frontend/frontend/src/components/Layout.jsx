import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Protección de ruta: Si no hay usuario y terminó de cargar, mandar al login
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
  if (!user) return null; // Evita parpadeo antes de redirigir

  // Función auxiliar para estilos de los links del menú
  // Se adapta al fondo oscuro: blanco brillante si está activo, semitransparente si no.
  const navLinkClass = ({ isActive }) =>
    `nav-link mb-2 rounded-3 p-3 d-flex align-items-center gap-3 transition-all ${
      isActive
        ? "text-white bg-white bg-opacity-25 fw-bold shadow-sm" // Estado Activo
        : "text-white-50 hover:text-white hover:bg-white hover:bg-opacity-10" // Estado Inactivo (con hover)
    }`;

  return (
    <div className="d-flex">
      {/* ================= SIDEBAR OSCURA PROFESIONAL ================= */}
      <div
        className="vh-100 position-fixed p-4 d-flex flex-column text-white shadow-lg"
        style={{
          width: "260px",
          backgroundColor: "var(--nc-primary)", // Usa el azul marino definido en CSS
          zIndex: 1000,
          transition: "all 0.3s ease",
        }}
      >
        {/* LOGO */}
        <div className="mb-5 d-flex align-items-center gap-2 ps-2">
            {/* Usamos el color de acento (cian) para el icono */}
            <i className="bi bi-shield-lock-fill fs-2" style={{color: "var(--nc-accent)"}}></i>
            <div style={{lineHeight: '1.1'}}>
                <h4 className="m-0 fw-black text-white" style={{letterSpacing: "1px", fontSize: '1.3rem'}}>NORTH CODE</h4>
                <small className="text-white-50" style={{fontSize: '0.8rem'}}>Soporte TI</small>
            </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="nav nav-pills flex-column flex-grow-1">
          <NavLink to="/" className={navLinkClass} end>
            <i className="bi bi-speedometer2 fs-5"></i> Inicio
          </NavLink>

          {/* Enlaces para CLIENTES */}
          {user.role === "CLIENT" && (
            <>
              <NavLink to="/nuevo-ticket" className={navLinkClass}>
                <i className="bi bi-plus-circle-fill fs-5"></i> Nuevo Reporte
              </NavLink>
              <NavLink to="/mis-tickets" className={navLinkClass}>
                <i className="bi bi-list-check fs-5"></i> Historial
              </NavLink>
            </>
          )}

          {/* Enlaces para STAFF (Admin y Soporte) */}
          {["ADMIN", "SUPPORT"].includes(user.role) && (
            <NavLink to="/monitor-global" className={navLinkClass}>
               <i className="bi bi-activity fs-5"></i> Monitor Global
            </NavLink>
          )}

          {/* Enlaces exclusivos ADMIN */}
          {user.role === "ADMIN" && (
            <NavLink to="/alta-personal" className={navLinkClass}>
               <i className="bi bi-person-badge-fill fs-5"></i> Alta de Personal
            </NavLink>
          )}
        </nav>

        {/* USUARIO Y LOGOUT */}
        <div className="mt-auto pt-4 border-top border-white border-opacity-10">
            <div className="d-flex align-items-center mb-3 ps-2">
                <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                    <i className="bi bi-person-fill fs-5 text-white"></i>
                </div>
                <div className="overflow-hidden">
                    <p className="m-0 fw-bold text-truncate">{user.firstName}</p>
                    <small className="text-white-50 text-truncate d-block" style={{fontSize: '0.75rem'}}>{user.role === 'CLIENT' ? 'Cliente' : user.department}</small>
                </div>
            </div>
          <button onClick={logout} className="btn btn-danger bg-gradient w-100 border-0 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm" style={{backgroundColor: '#d9534f'}}>
            <i className="bi bi-box-arrow-left fs-5"></i> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <div className="flex-grow-1" style={{ marginLeft: "260px", minHeight: "100vh", backgroundColor: "var(--bs-body-bg)" }}>
        <div className="container-fluid p-5">
          {/* Aquí se renderizan las páginas (Dashboard, Tickets, etc.) */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;