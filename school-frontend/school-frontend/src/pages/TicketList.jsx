import { useEffect, useState, useContext } from "react";
import { api } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets");
        setTickets(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTickets();
  }, []);

  // Función para colores de estado
  const getStatusBadge = (status) => {
    const colors = { ABIERTO: "success", EN_PROCESO: "warning", RESUELTO: "primary", CERRADO: "secondary" };
    return `badge bg-${colors[status] || "secondary"}`;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        {usuario.role === "CLIENT" ? "Mis Tickets" : "Panel de Soporte"}
      </h2>
      
      <div className="table-responsive">
        <table className="table table-hover shadow-sm bg-white rounded">
          <thead className="table-light">
            <tr>
              <th>Asunto</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>
              {usuario.role !== "CLIENT" && <th>Usuario</th>}
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id}>
                <td className="fw-bold">{t.title}</td>
                <td><span className="badge bg-light text-dark border">{t.category}</span></td>
                <td><span className={getStatusBadge(t.status)}>{t.status}</span></td>
                <td>
                  <span className={t.priority === "CRITICA" ? "text-danger fw-bold" : "text-dark"}>
                    {t.priority}
                  </span>
                </td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                {usuario.role !== "CLIENT" && <td>{t.createdBy?.email}</td>}
                <td>
                    <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-outline-primary">
                            Ver Detalles
                    </Link>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}