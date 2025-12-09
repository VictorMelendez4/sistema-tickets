import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/Dashboard";
import TicketList from "../pages/TicketList";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TicketForm from "../pages/TicketForm"; 
import TicketDetail from "../pages/TicketDetail"; 
import Layout from "../components/Layout";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-5 text-center">Cargando sistema...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 1. RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* 2. RUTAS PROTEGIDAS (Dentro del Layout) */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Dashboard Principal */}
        <Route path="/" element={<Dashboard />} />

        {/* --- RUTAS DE TICKETS --- */}
        
        {/* Para el Cliente: "Mis Tickets" */}
        <Route path="/mis-tickets" element={<TicketList />} />
        
        {/* Para el Cliente: "Nuevo Ticket" */}
        <Route path="/nuevo-ticket" element={<TicketForm />} />

        {/* Para Admin/Soporte: "Bandeja de Entrada" */}
        <Route path="/gestion-tickets" element={<TicketList />} />
        
        {/* Ruta genérica por si acaso */}
        <Route path="/tickets" element={<TicketList />} />

        {/* Detalle del Ticket (Para todos) */}
        <Route path="/tickets/:id" element={<TicketDetail />} />

      </Route>

      {/* 3. Ruta de error (Redirige al inicio) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}