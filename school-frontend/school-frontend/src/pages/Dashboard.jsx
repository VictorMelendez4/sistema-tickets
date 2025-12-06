import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { usuario } = useContext(AuthContext);

  return (
    <div className="container mt-4">
      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm">
        <div className="container-fluid py-3">
          <h1 className="display-5 fw-bold">Hola, {usuario?.firstName || "Usuario"} 👋</h1>
          <p className="col-md-8 fs-4 text-muted">
            Bienvenido al sistema de soporte técnico. 
            {usuario?.role === "CLIENT" 
              ? " Aquí puedes reportar incidencias y dar seguimiento a tus casos." 
              : " Aquí puedes gestionar y resolver los tickets asignados."}
          </p>
          
          {usuario?.role === "CLIENT" ? (
            <Link to="/nuevo-ticket" className="btn btn-primary btn-lg mt-3">
              <i className="bi bi-plus-circle me-2"></i> Crear un Ticket
            </Link>
          ) : (
            <Link to="/gestion-tickets" className="btn btn-success btn-lg mt-3">
              <i className="bi bi-inbox me-2"></i> Ver Tickets Pendientes
            </Link>
          )}
        </div>
      </div>

      {/* Tarjetas de Resumen (Estáticas por ahora, visualmente bonitas) */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card text-center border-0 shadow-sm h-100 py-4">
            <div className="card-body">
              <h1 className="text-primary"><i className="bi bi-ticket-detailed"></i></h1>
              <h5 className="card-title mt-2">Soporte Rápido</h5>
              <p className="card-text text-muted">Atención prioritaria a incidencias críticas.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center border-0 shadow-sm h-100 py-4">
            <div className="card-body">
              <h1 className="text-success"><i className="bi bi-laptop"></i></h1>
              <h5 className="card-title mt-2">Hardware & Software</h5>
              <p className="card-text text-muted">Reparación de equipos e instalación de programas.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center border-0 shadow-sm h-100 py-4">
            <div className="card-body">
              <h1 className="text-warning"><i className="bi bi-wifi"></i></h1>
              <h5 className="card-title mt-2">Redes</h5>
              <p className="card-text text-muted">Solución a problemas de conectividad e internet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}