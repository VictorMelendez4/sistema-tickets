import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      
      {/* Tarjeta de Bienvenida */}
      <div style={{ 
        backgroundColor: "#1e293b", 
        padding: "40px", 
        borderRadius: "16px", 
        marginBottom: "30px",
        border: "1px solid #334155"
      }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "2.5rem" }}>Hola, {user?.firstName} 👋</h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "30px" }}>
          Bienvenido al centro de soporte. 
          {user?.role === "CLIENT" 
            ? " ¿Tuviste algún problema con tu equipo? Estamos aquí para ayudarte." 
            : " Aquí tienes el resumen de tickets pendientes."}
        </p>

        {/* BOTONES DIFERENTES SEGÚN ROL */}
        {user?.role === "CLIENT" ? (
          <div style={{ display: "flex", gap: 15 }}>
            <Link to="/nuevo-ticket" style={{ textDecoration: "none", backgroundColor: "#3b82f6", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span>➕</span> Crear Nuevo Ticket
            </Link>
            <Link to="/mis-tickets" style={{ textDecoration: "none", backgroundColor: "transparent", border: "1px solid #475569", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold" }}>
              Ver mis casos
            </Link>
          </div>
        ) : (
          <Link to="/gestion-tickets" style={{ textDecoration: "none", backgroundColor: "#10b981", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold" }}>
            Ver Bandeja de Entrada
          </Link>
        )}
      </div>

      {/* Tarjetas Informativas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        <div style={{ backgroundColor: "#0f172a", padding: 24, borderRadius: 12, border: "1px solid #1e293b" }}>
          <h3 style={{ color: "#3b82f6" }}>Soporte Rápido</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>Atención prioritaria a incidencias críticas.</p>
        </div>
        <div style={{ backgroundColor: "#0f172a", padding: 24, borderRadius: 12, border: "1px solid #1e293b" }}>
          <h3 style={{ color: "#10b981" }}>Hardware & Software</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>Reparación de equipos e instalación.</p>
        </div>
        <div style={{ backgroundColor: "#0f172a", padding: 24, borderRadius: 12, border: "1px solid #1e293b" }}>
          <h3 style={{ color: "#f59e0b" }}>Redes</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>Problemas de conectividad e internet.</p>
        </div>
      </div>

    </div>
  );
}