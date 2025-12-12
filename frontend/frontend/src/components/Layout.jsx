import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary"></div></div>;
  if (!user) return null;

  const navLinkClass = ({ isActive }) =>
    `nav-link mb-2 rounded-3 p-3 d-flex align-items-center gap-3 transition-all ${
      isActive
        ? "text-white bg-white bg-opacity-25 fw-bold shadow-sm"
        : "text-white-50 hover:text-white hover:bg-white hover:bg-opacity-10"
    }`;

  return (
    <div className="d-flex">
      {/* SIDEBAR */}
      <div className="vh-100 position-fixed p-4 d-flex flex-column text-white shadow-lg"
        style={{ width: "260px", backgroundColor: "var(--nc-primary)", zIndex: 1000 }}>
        
        {/* LOGO */}
        <div className="mb-5 d-flex align-items-center gap-2 ps-2">
            <i className="bi bi-shield-lock-fill fs-2" style={{color: "var(--nc-accent)"}}></i>
            <div>
                <h4 className="m-0 fw-black text-white" style={{fontSize: '1.3rem'}}>NORTH CODE</h4>
                <small className="text-white-50">Soporte TI</small>
            </div>
        </div>

        {/* MENÚ */}
        <nav className="nav nav-pills flex-column flex-grow-1 overflow-auto">
          <small className="text-white-50 text-uppercase fw-bold mb-2 ps-3" style={{fontSize: '0.7rem'}}>General</small>
          
          <NavLink to="/" className={navLinkClass} end>
            <i className="bi bi-speedometer2 fs-5"></i> Inicio
          </NavLink>

          {/* 👇 ¡AQUÍ ESTÁ EL BOTÓN QUE FALTABA! */}
          <NavLink to="/perfil" className={navLinkClass}>
            <i className="bi bi-person-gear fs-5"></i> Mi Perfil
          </NavLink>

          {/* CLIENTES */}
          {user.role === "CLIENT" && (
            <>
              <small className="text-white-50 text-uppercase fw-bold mt-3 mb-2 ps-3" style={{fontSize: '0.7rem'}}>Mis Reportes</small>
              <NavLink to="/nuevo-ticket" className={navLinkClass}>
                <i className="bi bi-plus-circle-fill fs-5"></i> Nuevo Reporte
              </NavLink>
              <NavLink to="/mis-tickets" className={navLinkClass}>
                <i className="bi bi-list-check fs-5"></i> Historial
              </NavLink>
            </>
          )}

          {/* STAFF (Admin y Soporte) */}
          {["ADMIN", "SUPPORT"].includes(user.role) && (
            <>
              <small className="text-white-50 text-uppercase fw-bold mt-3 mb-2 ps-3" style={{fontSize: '0.7rem'}}>Gestión</small>
              {/* Este enlace ahora sí funcionará con el router corregido */}
              <NavLink to="/monitor-global" className={navLinkClass}>
                 <i className="bi bi-activity fs-5"></i> Monitor Global
              </NavLink>
              <NavLink to="/bandeja-entrada" className={navLinkClass}>
                 <i className="bi bi-inbox fs-5"></i> Bandeja Entrada
              </NavLink>
            </>
          )}

          {/* ADMIN */}
          {user.role === "ADMIN" && (
            <>
                <small className="text-white-50 text-uppercase fw-bold mt-3 mb-2 ps-3" style={{fontSize: '0.7rem'}}>Administración</small>
                <NavLink to="/usuarios" className={navLinkClass}>
                   <i className="bi bi-people-fill fs-5"></i> Usuarios
                </NavLink>
                <NavLink to="/alta-personal" className={navLinkClass}>
                   <i className="bi bi-person-plus-fill fs-5"></i> Alta Personal
                </NavLink>
            </>
          )}
        </nav>

        {/* FOOTER USUARIO */}
        <div className="mt-auto pt-4 border-top border-white border-opacity-10">
            <div className="d-flex align-items-center mb-3 ps-2">
                <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                    <i className="bi bi-person-fill fs-5 text-white"></i>
                </div>
                <div className="overflow-hidden">
                    <p className="m-0 fw-bold text-truncate">{user.firstName}</p>
                    <small className="text-white-50 d-block">{user.role === 'CLIENT' ? 'Cliente' : user.department}</small>
                </div>
            </div>
          <button onClick={logout} className="btn btn-danger w-100 border-0 py-2 shadow-sm">
            <i className="bi bi-box-arrow-left fs-5 me-2"></i> Salir
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-grow-1" style={{ marginLeft: "260px", minHeight: "100vh", backgroundColor: "var(--bs-body-bg)" }}>
        <div className="container-fluid p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;