import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/Dashboard";
import TicketList from "../pages/TicketList";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TicketForm from "../pages/TicketForm"; 
import TicketDetail from "../pages/TicketDetail"; 
import Profile from "../pages/Profile";
import CreateSupport from "../pages/CreateSupport"; // Asegúrate de que este archivo exista
import UserList from "../pages/UserList"; 
import Layout from "../components/Layout";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Cargando sistema...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        
        {/* INICIO (Dashboard General) */}
        <Route path="/" element={<Dashboard />} />
        
        {/* PERFIL (Cambio de contraseña) */}
        <Route path="/perfil" element={<Profile />} />

        {/* CLIENTES */}
        <Route path="/nuevo-ticket" element={<TicketForm />} />
        <Route path="/mis-tickets" element={<TicketList viewType="CLIENT" />} />

        {/* STAFF (Soporte y Admin) */}
        {/* El Monitor Global usa el mismo Dashboard pero mostrará más datos por ser Staff */}
        <Route path="/monitor-global" element={<Dashboard />} />
        
        <Route path="/bandeja-entrada" element={<TicketList viewType="AVAILABLE" />} />
        <Route path="/mis-casos" element={<TicketList viewType="MINE" />} />
        
        {/* DETALLE DE TICKET */}
        <Route path="/tickets/:id" element={<TicketDetail />} />
        
        {/* SOLO ADMIN */}
        {user?.role === "ADMIN" && (
           <>
             {/* 👇 AQUÍ CORREGIMOS EL NOMBRE PARA QUE COINCIDA CON EL SIDEBAR */}
             <Route path="/alta-personal" element={<CreateSupport />} />
             <Route path="/usuarios" element={<UserList />} />
           </>
        )}

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}