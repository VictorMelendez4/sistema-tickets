import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/Dashboard";
import TicketList from "../pages/TicketList";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TicketForm from "../pages/TicketForm"; 
import TicketDetail from "../pages/TicketDetail"; 
import CreateSupport from "../pages/CreateSupport"; // <--- NUEVA PÁGINA
import Layout from "../components/Layout";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Cargando sistema...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ... rutas públicas ... */}

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* --- RUTAS DE CLIENTE --- */}
        <Route path="/nuevo-ticket" element={<TicketForm />} />
        <Route path="/mis-tickets" element={<TicketList viewType="CLIENT" />} />

        {/* --- RUTAS DE SOPORTE / ADMIN --- */}
        {/* Aquí reciclamos TicketList pero le decimos qué mostrar */}
        
        <Route path="/bandeja-entrada" element={<TicketList viewType="AVAILABLE" />} />
        
        <Route path="/mis-casos" element={<TicketList viewType="MINE" />} />
        
        {/* --- DETALLE Y ALTA --- */}
        <Route path="/tickets/:id" element={<TicketDetail />} />
        {user?.role === "ADMIN" && (
           <Route path="/crear-staff" element={<CreateSupport />} />
        )}

      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}