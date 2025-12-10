import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/Dashboard";
import TicketList from "../pages/TicketList";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TicketForm from "../pages/TicketForm"; 
import TicketDetail from "../pages/TicketDetail"; 
import CreateSupport from "../pages/CreateSupport"; 
import Layout from "../components/Layout";

// COMPONENTE PROTECTOR MEJORADO
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // 1. Si estamos verificando sesión, mostramos un spinner y NO hacemos nada más.
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Cargando sistema...</div>;
  }

  // 2. Si terminó de cargar y NO hay usuario, entonces sí redirigimos.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si todo bien, mostramos la app.
  return children;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 1. RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* 2. RUTAS PROTEGIDAS */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* --- CLIENTE --- */}
        <Route path="/nuevo-ticket" element={<TicketForm />} />
        <Route path="/mis-tickets" element={<TicketList viewType="CLIENT" />} />

        {/* --- SOPORTE / ADMIN --- */}
        <Route path="/bandeja-entrada" element={<TicketList viewType="AVAILABLE" />} />
        <Route path="/mis-casos" element={<TicketList viewType="MINE" />} />
        
        {/* --- DETALLES Y ADMIN --- */}
        <Route path="/tickets/:id" element={<TicketDetail />} />
        
        {user?.role === "ADMIN" && (
           <Route path="/crear-staff" element={<CreateSupport />} />
        )}

      </Route>

      {/* 3. Ruta de descarte (Redirige al inicio) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}