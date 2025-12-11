import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  // 1. Contenedor Principal: Ocupa toda la pantalla y no deja que nada se salga
  const layoutContainerStyle = {
    display: "flex",
    height: "100vh", // Altura exacta de la ventana
    overflow: "hidden", // Evita scroll doble en el navegador
    backgroundColor: "#1a1f2c", // Fondo base oscuro
  };

  // 2. Sidebar: Ancho fijo, y si es muy alto, tiene su propio scroll
  const sidebarStyle = {
    width: "260px",
    backgroundColor: "#1a1f2c",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    borderRight: "1px solid rgba(255,255,255,0.05)", // Línea sutil divisora
    overflowY: "auto", // Scroll interno si el menú es muy largo
    flexShrink: 0, // No permitimos que se encoja
  };

  // 3. Main: Toma el resto del espacio y TIENE SU PROPIO SCROLL
  const mainStyle = {
    flex: 1, // Ocupa todo el espacio restante
    backgroundColor: "#121212", // Fondo muy oscuro para el contenido (Dark Mode)
    overflowY: "auto", // <--- AQUÍ ESTÁ EL TRUCO: El scroll está dentro de este panel
    padding: "0",
    position: "relative"
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    textDecoration: "none",
    color: isActive ? "white" : "rgba(255,255,255,0.7)",
    backgroundColor: isActive ? "#0d6efd" : "transparent",
    borderRadius: "8px",
    marginBottom: "8px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "all 0.2s"
  });

  const sectionTitleStyle = {
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
    marginTop: "20px",
    marginBottom: "10px",
    letterSpacing: "1px"
  };

  return (
    <div style={layoutContainerStyle}>
      
      {/* === SIDEBAR IZQUIERDO === */}
      <aside style={sidebarStyle} className="custom-scroll">
        
        {/* LOGO */}
        <div className="mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-ticket-perforated-fill fs-3 text-primary"></i>
            <h4 className="m-0 fw-bold">North Code</h4>
        </div>

        {/* MENÚ */}
        <nav className="flex-grow-1">
            <NavLink to="/" style={linkStyle}>
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </NavLink>

            {/* SECCIÓN CLIENTE */}
            {user.role === "CLIENT" && (
                <>
                    <div style={sectionTitleStyle}>OPERACIONES</div>
                    <NavLink to="/nuevo-ticket" style={linkStyle}>
                        <i className="bi bi-plus-circle me-2"></i> Nuevo Reporte
                    </NavLink>
                    <NavLink to="/mis-tickets" style={linkStyle}>
                        <i className="bi bi-list-ul me-2"></i> Mis Tickets
                    </NavLink>
                </>
            )}

            {/* SECCIÓN SOPORTE */}
            {(user.role === "SUPPORT" || user.role === "ADMIN") && (
                <>
                    <div style={sectionTitleStyle}>SOPORTE</div>
                    <NavLink to="/bandeja-entrada" style={linkStyle}>
                        <i className="bi bi-inbox me-2"></i> Bandeja de Entrada
                    </NavLink>
                    <NavLink to="/mis-casos" style={linkStyle}>
                        <i className="bi bi-briefcase me-2"></i> Mis Casos Activos
                    </NavLink>
                </>
            )}

            {/* SECCIÓN ADMIN */}
            {user.role === "ADMIN" && (
                <>
                    <div style={sectionTitleStyle}>ADMINISTRACIÓN</div>
                    <NavLink to="/tickets-global" style={linkStyle}>
                        <i className="bi bi-globe me-2"></i> Monitor Global
                    </NavLink>
                    <NavLink to="/crear-staff" style={linkStyle}>
                        <i className="bi bi-person-plus me-2"></i> Alta de Personal
                    </NavLink>
                    <NavLink to="/usuarios" style={linkStyle}>
                        <i className="bi bi-people me-2"></i> Gestionar Usuarios
                    </NavLink>
                </>
            )}
        </nav>

{/* FOOTER USUARIO */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <div className="d-flex align-items-center mb-3">
                <div 
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold"
                    style={{ width: "40px", height: "40px", minWidth: "40px" }}
                >
                    {user.firstName.charAt(0)}
                </div>
                <div style={{ overflow: "hidden" }}>
                    <h6 className="m-0 fw-bold text-truncate" title={`${user.firstName} ${user.lastName}`}>
                        {user.firstName} {user.lastName}
                    </h6>
                    
                    {/* ROL */}
                    <small className="text-white-50 d-block" style={{ fontSize: "0.7rem", lineHeight: "1.2" }}>
                        {user.role}
                    </small>

                    
                    {user.department && (
                        <small className="text-info d-block text-truncate" style={{ fontSize: "0.65rem", opacity: 0.9 }}>
                            <i className="bi bi-building me-1"></i>{user.department}
                        </small>
                    )}
                </div>
            </div>

            <Link to="/perfil" className="btn btn-sm btn-outline-light w-100 mb-2 border-0 text-start ps-3">
                <i className="bi bi-person-gear me-2"></i> Mi Perfil
            </Link>

            <button onClick={logout} className="btn btn-sm btn-outline-danger w-100 border-0 text-start ps-3">
                <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
            </button>
        </div>
      </aside>

      {/* === CONTENIDO PRINCIPAL DERECHO === */}
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}