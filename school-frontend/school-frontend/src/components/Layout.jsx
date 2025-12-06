import { Outlet, Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
// 1. Importamos el componente de notificaciones
import { Toaster } from "react-hot-toast";

export default function Layout() {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();

  // Función para resaltar el enlace activo
  const isActive = (path) =>
    location.pathname === path
      ? "bg-primary text-white shadow-sm"
      : "text-dark hover-bg-light";

  return (
    <div className="d-flex min-vh-100 bg-light">
      
      {/* === SIDEBAR (MENÚ LATERAL) === */}
      <div
        className="d-flex flex-column p-3 bg-white border-end shadow-sm"
        style={{ width: "260px", position: "fixed", height: "100%", zIndex: 1000 }}
      >
        {/* Marca / Logo */}
        <div className="d-flex align-items-center mb-4 px-2 mt-2">
          <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center me-2" style={{ width: 35, height: 35 }}>
            <i className="bi bi-headset text-white fs-5"></i>
          </div>
          <span className="fs-5 fw-bold text-dark tracking-tight">HelpDesk Pro</span>
        </div>

        <hr className="text-muted opacity-25" />

        {/* Navegación */}
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-1">
            <Link to="/" className={`nav-link d-flex align-items-center gap-2 ${isActive("/")}`}>
              <i className="bi bi-speedometer2"></i> Dashboard
            </Link>
          </li>

          {/* MENÚ PARA CLIENTES */}
          {usuario?.role === "CLIENT" && (
            <>
              <li className="nav-item mt-3 mb-1">
                <small className="text-uppercase text-muted fw-bold ps-3" style={{ fontSize: "0.7rem" }}>
                  Mis Gestiones
                </small>
              </li>
              <li className="nav-item mb-1">
                <Link to="/nuevo-ticket" className={`nav-link d-flex align-items-center gap-2 ${isActive("/nuevo-ticket")}`}>
                  <i className="bi bi-plus-circle"></i> Nuevo Ticket
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link to="/mis-tickets" className={`nav-link d-flex align-items-center gap-2 ${isActive("/mis-tickets")}`}>
                  <i className="bi bi-ticket-perforated"></i> Mis Tickets
                </Link>
              </li>
            </>
          )}

          {/* MENÚ PARA SOPORTE / ADMIN */}
          {(usuario?.role === "ADMIN" || usuario?.role === "SUPPORT") && (
            <>
              <li className="nav-item mt-3 mb-1">
                <small className="text-uppercase text-muted fw-bold ps-3" style={{ fontSize: "0.7rem" }}>
                  Administración
                </small>
              </li>
              <li className="nav-item mb-1">
                <Link to="/gestion-tickets" className={`nav-link d-flex align-items-center gap-2 ${isActive("/gestion-tickets")}`}>
                  <i className="bi bi-inbox"></i> Bandeja de Tickets
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Footer del Usuario */}
        <div className="mt-auto border-top pt-3">
          <div className="d-flex align-items-center mb-3 px-2">
            <div
              className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold"
              style={{ width: 38, height: 38 }}
            >
              {usuario?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="fw-bold text-dark small text-truncate">
                {usuario?.firstName}
              </div>
              <div className="text-muted small text-truncate" style={{ fontSize: "0.75rem" }}>
                {usuario?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* === CONTENIDO PRINCIPAL === */}
      <div className="flex-grow-1" style={{ marginLeft: "260px" }}>
        {/* Aquí renderizamos las páginas */}
        <div className="p-4">
          <Outlet />
        </div>

        {/* 2. Aquí vive el "Tostador" para las notificaciones */}
        <Toaster 
          position="top-right" 
          reverseOrder={false} 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#dcfce7', // Verde claro
                color: '#166534',      // Verde oscuro
                border: '1px solid #bbf7d0'
              },
            },
            error: {
              style: {
                background: '#fee2e2', // Rojo claro
                color: '#991b1b',      // Rojo oscuro
                border: '1px solid #fecaca'
              },
            },
          }}
        />
      </div>
    </div>
  );
}