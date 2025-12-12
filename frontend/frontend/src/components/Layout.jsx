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

  // 🛡️ PROTECCIÓN ANTI-CRASH (DOBLE SEGURIDAD)
  // Convertimos a String explícitamente para evitar errores con null/undefined
  const safeName = String(user.firstName || "Usuario");
  const safeInitial = safeName.charAt(0).toUpperCase();
  const safeRole = user.role === 'CLIENT' ? 'Cliente' : (user.department || user.role);

  // Clases CSS corregidas para lista vertical limpia
  const navLinkClass = ({ isActive }) =>
    `nav-link mb-2 rounded-3 p-3 d-flex align-items-center gap-3 transition-all w-100 text-decoration-none ${
      isActive
        ? "text-white bg-white bg-opacity-25 fw-bold shadow-sm"
        : "text-white-50 hover:text-white hover:bg-white hover:bg-opacity-10"
    }`;

  return (
    <div className="d-flex">
      {/* SIDEBAR FIJO */}
      <div className="vh-100 position-fixed p-4 d-flex flex-column text-white shadow-lg"
        style={{ width: "260px", backgroundColor: "var(--nc-primary)", zIndex: 1000 }}>
        
        {/* LOGO */}
        <div className="mb-4 d-flex align-items-center gap-2 ps-2">
            <i className="bi bi-shield-lock-fill fs-2" style={{color: "var(--nc-accent)"}}></i>
            <div style={{lineHeight: '1.2'}}>
                <h4 className="m-0 fw-black text-white" style={{fontSize: '1.2rem', letterSpacing: '1px'}}>NORTH CODE</h4>
                <small className="text-white-50" style={{fontSize: '0.75rem'}}>Soporte TI</small>
            </div>
        </div>

        {/* MENÚ VERTICAL CON SCROLL */}
        <div className="flex-grow-1 overflow-auto pe-2 custom-scrollbar">
            <nav className="nav flex-column w-100">
              <small className="text-white-50 text-uppercase fw-bold mb-2 ps-3 mt-2" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>General</small>
              
              <NavLink to="/" className={navLinkClass} end>
                <i className="bi bi-speedometer2 fs-5"></i> Inicio
              </NavLink>

              <NavLink to="/perfil" className={navLinkClass}>
                <i className="bi bi-person-gear fs-5"></i> Mi Perfil
              </NavLink>

              {/* VISTA CLIENTE */}
              {user.role === "CLIENT" && (
                <>
                  <small className="text-white-50 text-uppercase fw-bold mt-3 mb-2 ps-3" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Mis Reportes</small>
                  <NavLink to="/nuevo-ticket" className={navLinkClass}>
                    <i className="bi bi-plus-circle-fill fs-5"></i> Nuevo Reporte
                  </NavLink>
                  <NavLink to="/mis-tickets" className={navLinkClass}>
                    <i className="bi bi-list-check fs-5"></i> Historial
                  </NavLink>
                </>
              )}

              {/* VISTA STAFF (Admin y Soporte) */}
              {["ADMIN", "SUPPORT"].includes(user.role) && (
                <>
                  <small className="text-white-50 text-uppercase fw-bold mt-3 mb-2 ps-3" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Operaciones</small>
                  
                  {/* Este botón ahora sí lleva a la lista completa */}
                  <NavLink to="/monitor-global" className={navLinkClass}>
                     <i className="bi bi-collection-fill fs-5"></i> Monitor Global
                  </NavLink>
                  
                  <NavLink to="/bandeja-entrada" className={navLinkClass}>
                     <i className="bi bi-inbox fs-5"></i> Bandeja (Sin Asignar)
                  </NavLink>

                  <NavLink to="/mis-casos" className={navLinkClass}>
                     <i className="bi bi-briefcase fs-5"></i> Mis Casos
                  </NavLink>
                </>
              )}

              {/* VISTA ADMIN */}
              {user.role === "ADMIN" && (
                <>
                    <small className="text-white-50 text-uppercase fw-bold mt-3 mb-2 ps-3" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Administración</small>
                    <NavLink to="/usuarios" className={navLinkClass}>
                       <i className="bi bi-people-fill fs-5"></i> Usuarios
                    </NavLink>
                    <NavLink to="/alta-personal" className={navLinkClass}>
                       <i className="bi bi-person-plus-fill fs-5"></i> Alta Personal
                    </NavLink>
                </>
              )}
            </nav>
        </div>

        {/* FOOTER USUARIO */}
        <div className="mt-3 pt-3 border-top border-white border-opacity-10">
            <div className="d-flex align-items-center mb-3 ps-2">
                <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-3" style={{minWidth: '40px', height: '40px'}}>
                    <span className="fw-bold fs-5">{safeInitial}</span>
                </div>
                <div className="overflow-hidden">
                    <p className="m-0 fw-bold text-truncate" style={{fontSize: '0.9rem'}}>{safeName}</p>
                    <small className="text-white-50 d-block text-truncate" style={{fontSize: '0.75rem'}}>{safeRole}</small>
                </div>
            </div>
          <button onClick={logout} className="btn btn-danger w-100 border-0 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2" style={{transition: 'all 0.2s'}}>
            <i className="bi bi-box-arrow-left fs-5"></i> Salir
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-grow-1" style={{ marginLeft: "260px", minHeight: "100vh", backgroundColor: "var(--bs-body-bg)" }}>
        <div className="container-fluid p-4 p-lg-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;