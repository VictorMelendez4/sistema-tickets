import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toaster } from 'react-hot-toast';

function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email;

  // ESTILOS -----------------------------------------
  
  // 1. Estilo para los botones (Links)
  const linkStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    borderRadius: 8, textDecoration: "none", fontSize: 14,
    color: isActive ? "#e5e7eb" : "#9ca3af",
    backgroundColor: isActive ? "#1d4ed8" : "transparent",
    transition: "all 0.2s"
  });

  // 2. Estilo para los Títulos de Sección (Tu nuevo estilo)
  const sectionTitleStyle = {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
    marginTop: 15,
    marginBottom: 5,
    paddingLeft: 10,
    letterSpacing: "0.5px"
  };

  // --------------------------------------------------

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#020617", color: "#e5e7eb", fontFamily: "sans-serif" }}>
      
      {/* SIDEBAR FIJO */}
      <aside style={{ width: 260, backgroundColor: "#0f172a", borderRight: "1px solid #1e293b", padding: "24px 16px", display: "flex", flexDirection: "column", position: "fixed", height: "100%", zIndex: 1000 }}>
        
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingLeft: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎫</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "white" }}>HelpDesk</div>
        </div>

        {/* NAVEGACIÓN ORGANIZADA */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          
          {/* === SECCIÓN: GENERAL === */}
          <NavLink to="/" end style={linkStyle}>
            <span>🏠</span> Dashboard
          </NavLink>

          {/* === SECCIÓN: CLIENTE (Solo si eres cliente) === */}
          {user?.role === "CLIENT" && (
            <>
              <div style={sectionTitleStyle}>MI SOPORTE</div>
              
              <NavLink to="/nuevo-ticket" style={linkStyle}>
                <span>➕</span> Nuevo Reporte
              </NavLink>
              
              <NavLink to="/mis-tickets" style={linkStyle}>
                <span>📂</span> Mis Reportes
              </NavLink>
            </>
          )}

          {/* === SECCIÓN: OPERACIONES (Soporte y Admin) === */}
          {(user?.role === "ADMIN" || user?.role === "SUPPORT") && (
            <>
              <div style={sectionTitleStyle}>OPERACIONES</div>
              
              <NavLink to="/bandeja-entrada" style={linkStyle}>
                <span>📥</span> Bandeja de Entrada
              </NavLink>

              <NavLink to="/mis-casos" style={linkStyle}>
                <span>💼</span> Mis Casos Activos
              </NavLink>
            </>
          )}

          {/* === SECCIÓN: ADMINISTRACIÓN (Solo Admin) === */}
          {user?.role === "ADMIN" && (
            <>
              <div style={sectionTitleStyle}>ADMINISTRACIÓN</div>
              
              <NavLink to="/crear-staff" style={linkStyle}>
                <span>👨‍💻</span> Alta de Personal
              </NavLink>

              <NavLink to="/usuarios" style={linkStyle}>
                <span>👥</span> Gestionar Usuarios
              </NavLink>
              
              {/* Aquí podrás agregar más cosas a futuro, como: */}
              {/* <NavLink to="/reportes" style={linkStyle}>📊 Reportes</NavLink> */}
            </>
          )}

        </nav>

        {/* FOOTER USUARIO */}
        <div style={{ marginTop: "auto", borderTop: "1px solid #1e293b", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" }}>
              {user?.firstName?.charAt(0) || "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 13, transition: "0.2s" }} onMouseOver={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"} onMouseOut={(e) => e.target.style.background = "transparent"}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Outlet) */}
      <main style={{ flex: 1, padding: "30px", marginLeft: 260, backgroundColor: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
        <Outlet />
        <Toaster position="top-right" />
      </main>
    </div>
  );
}

export default Layout;