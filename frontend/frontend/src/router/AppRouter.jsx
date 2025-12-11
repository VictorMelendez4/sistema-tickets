import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/Dashboard";
import TicketList from "../pages/TicketList";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TicketForm from "../pages/TicketForm"; 
import TicketDetail from "../pages/TicketDetail"; 
import Profile from "../pages/Profile";
import CreateSupport from "../pages/CreateSupport"; 
import UserList from "../pages/UserList"; // <--- IMPORTANTE: Importar la nueva página
import Layout from "../components/Layout";

// COMPONENTE PROTECTOR MEJORADO (Sin bucles infinitos)
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // 1. Si estamos verificando sesión, mostramos un spinner y NO redirigimos aún.
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Cargando sistema...</div>;
  }

  // 2. Si terminó de cargar y NO hay usuario, entonces sí redirigimos al login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si todo bien, mostramos la app protegida.
  return children;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* === 1. RUTAS PÚBLICAS === */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* === 2. RUTAS PROTEGIDAS (Con Layout) === */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        
        {/* Dashboard General */}
        <Route path="/" element={<Dashboard />} />

        <Route path="/perfil" element={<Profile />} />

        {/* --- RUTAS DE CLIENTE --- */}
        <Route path="/nuevo-ticket" element={<TicketForm />} />
        <Route path="/mis-tickets" element={<TicketList viewType="CLIENT" />} />

        {/* --- RUTAS DE SOPORTE / ADMIN --- */}
        <Route path="/bandeja-entrada" element={<TicketList viewType="AVAILABLE" />} />
        <Route path="/mis-casos" element={<TicketList viewType="MINE" />} />
        <Route path="/tickets-global" element={<TicketList viewType="ALL" />} />
        
        {/* --- DETALLES DE TICKET (Para todos) --- */}
        <Route path="/tickets/:id" element={<TicketDetail />} />
        
        {/* --- SOLO ADMIN --- */}
        {user?.role === "ADMIN" && (
           <>
             <Route path="/crear-staff" element={<CreateSupport />} />
             <Route path="/usuarios" element={<UserList />} /> {/* <--- NUEVA RUTA DE GESTIÓN */}
           </>
        )}

      </Route>

      {/* === 3. RUTA DE DESCARTE (Cualquier url rara va al inicio) === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}