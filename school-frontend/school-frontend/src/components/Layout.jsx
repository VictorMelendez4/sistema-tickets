import { Outlet, Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Layout() {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();

  // Función para determinar estilos del link activo
  const getNavLinkClass = (path) => {
    const baseClass = "nav-link d-flex align-items-center px-3 py-2 rounded-3 mb-1 transition-all";
    if (location.pathname === path) {
      // Activo: Fondo Indigo suave, texto Indigo fuerte, negrita
      return `${baseClass} bg-indigo-soft text-primary fw-bold shadow-sm`;
    }
    // Inactivo: Texto gris, hover suave
    return `${baseClass} text-muted hover-bg-light`;
  };

  return (
    <div className="d-flex min-vh-100 bg-body">
      {/* === SIDEBAR === */}
      <div className="d-flex flex-column p-4 bg-white border-end shadow-sm" style={{ width: "280px", position: "fixed", height: "100%", zIndex: 10 }}>
        
        {/* Logo / Marca */}
        <div className="mb-4 px-2">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center" style={{width: 35, height: 35}}>
              <i className="bi bi-mortarboard-fill text-white fs-5"></i>
            </div>
            <span className="fs-5 fw-bold text-dark tracking-tight">EduManager</span>
          </div>
        </div>
        
        {/* Navegación */}
        <ul className="nav nav-pills flex-column mb-auto">
          {/* ... (Aquí va tu lógica de ADMIN igual que antes) ... */}
          {usuario?.role === "ADMIN" && (
            <>
               <li className="nav-item"><small className="text-uppercase text-muted fw-bold ms-3 mb-2 d-block" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Administración</small></li>
               <li><Link to="/" className={getNavLinkClass("/")}><i className="bi bi-grid me-3"></i>Dashboard</Link></li>
               <li><Link to="/alumnos" className={getNavLinkClass("/alumnos")}><i className="bi bi-people me-3"></i>Alumnos</Link></li>
               <li><Link to="/docentes" className={getNavLinkClass("/docentes")}><i className="bi bi-person-badge me-3"></i>Docentes</Link></li>
               <li><Link to="/cursos" className={getNavLinkClass("/cursos")}><i className="bi bi-book me-3"></i>Cursos</Link></li>
               <li><Link to="/grupos" className={getNavLinkClass("/grupos")}><i className="bi bi-collection me-3"></i>Grupos</Link></li>
            </>
          )}

          <li className="nav-item mt-4"><small className="text-uppercase text-muted fw-bold ms-3 mb-2 d-block" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Docencia</small></li>
          <li>
            <Link to="/panel-docente" className={getNavLinkClass("/panel-docente")}>
              <i className="bi bi-easel me-3"></i>Mi Panel
            </Link>
          </li>
        </ul>
        
        {/* Usuario Footer */}
        <div className="mt-auto pt-3 border-top">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="bg-light rounded-circle border d-flex align-items-center justify-content-center text-primary fw-bold" style={{width: 40, height: 40}}>
              {usuario?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="d-flex flex-column" style={{lineHeight: '1.2'}}>
              <span className="fw-bold text-dark small text-truncate" style={{maxWidth: '140px'}}>{usuario?.email}</span>
              <span className="text-muted" style={{fontSize: '0.75rem'}}>{usuario?.role}</span>
            </div>
          </div>
          <button onClick={logout} className="btn btn-outline-secondary btn-sm w-100 border-0 bg-light text-muted">
            <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
          </button>
        </div>
      </div>

      {/* === CONTENIDO PRINCIPAL === */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Contenedor con ancho máximo para que no se estire en pantallas gigantes */}
        <div className="container-fluid" style={{ maxWidth: "1200px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}