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

  // Estilos base para los links
  const linkStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    borderRadius: 8, textDecoration: "none", fontSize: 14,
    color: isActive ? "#e5e7eb" : "#9ca3af",
    backgroundColor: isActive ? "#1d4ed8" : "transparent",
    transition: "all 0.2s"
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#020617", color: "#e5e7eb", fontFamily: "sans-serif" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: 260, backgroundColor: "#0f172a", borderRight: "1px solid #1e293b", padding: "24px 16px", display: "flex", flexDirection: "column", position: "fixed", height: "100%" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30, paddingLeft: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎫</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "white" }}>HelpDesk</div>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          
          <NavLink to="/" end style={linkStyle}>
            <span>🏠</span> Dashboard
          </NavLink>

          {/* OPCIONES SOLO PARA CLIENTE */}
          {user?.role === "CLIENT" && (
            <>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b", marginTop: 10, paddingLeft: 10 }}>Mi Soporte</div>
              
              <NavLink to="/nuevo-ticket" style={linkStyle}>
                <span>➕</span> Nuevo Ticket
              </NavLink>
              
              <NavLink to="/mis-tickets" style={linkStyle}>
                <span>📂</span> Mis Tickets
              </NavLink>
            </>
          )}

          {/* OPCIONES SOLO PARA ADMIN / SOPORTE */}
          {(user?.role === "ADMIN" || user?.role === "SUPPORT") && (
            <>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b", marginTop: 10, paddingLeft: 10 }}>Administración</div>
              
              <NavLink to="/gestion-tickets" style={linkStyle}>
                <span>📥</span> Bandeja de Entrada
              </NavLink>
            </>
          )}

        </nav>

        {/* Footer Usuario */}
        <div style={{ marginTop: "auto", borderTop: "1px solid #1e293b", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {displayName.charAt(0)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main style={{ flex: 1, padding: "30px", marginLeft: 260, backgroundColor: "#020617" }}>
        <Outlet />
        <Toaster position="top-right" />
      </main>
    </div>
  );
}

export default Layout;