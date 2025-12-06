import { Outlet, Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Layout() {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "bg-primary text-white" : "text-dark";

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className="d-flex flex-column p-3 bg-light border-end" style={{ width: "260px" }}>
        <h4 className="text-primary fw-bold mb-4 px-2">🎫 HelpDesk Pro</h4>
        
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2">
            <Link to="/" className={`nav-link ${isActive("/")}`}>
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>
          </li>

          {/* Menú para CLIENTES */}
          {usuario?.role === "CLIENT" && (
            <>
              <li className="nav-item mb-2">
                <Link to="/nuevo-ticket" className={`nav-link ${isActive("/nuevo-ticket")}`}>
                  <i className="bi bi-plus-circle me-2"></i> Nuevo Ticket
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/mis-tickets" className={`nav-link ${isActive("/mis-tickets")}`}>
                  <i className="bi bi-ticket-perforated me-2"></i> Mis Tickets
                </Link>
              </li>
            </>
          )}

          {/* Menú para SOPORTE / ADMIN */}
          {(usuario?.role === "ADMIN" || usuario?.role === "SUPPORT") && (
            <>
              <li className="nav-item mb-2">
                <Link to="/gestion-tickets" className={`nav-link ${isActive("/gestion-tickets")}`}>
                  <i className="bi bi-inbox me-2"></i> Bandeja de Tickets
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="mt-auto border-top pt-3">
          <div className="d-flex align-items-center mb-2">
            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: 32, height: 32}}>
              {usuario?.email?.charAt(0).toUpperCase()}
            </div>
            <small className="text-muted text-truncate" style={{maxWidth: "150px"}}>
              {usuario?.email}
            </small>
          </div>
          <button onClick={logout} className="btn btn-outline-danger btn-sm w-100">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-grow-1 p-4 bg-white" style={{ overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}