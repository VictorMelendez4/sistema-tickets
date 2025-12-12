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
import UserList from "../pages/UserList"; 
import Layout from "../components/Layout";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        
        {/* INICIO */}
        <Route path="/" element={<Dashboard />} />
        
        {/* 👇 1. AGREGAMOS ESTA RUTA PARA QUE "MONITOR GLOBAL" FUNCIONE */}
        {/* Reusamos el Dashboard porque ahí pusiste las gráficas */}
        <Route path="/monitor-global" element={<Dashboard />} />

        {/* 👇 2. AGREGAMOS LA RUTA DE PERFIL */}
        <Route path="/perfil" element={<Profile />} />

        {/* CLIENTES */}
        <Route path="/nuevo-ticket" element={<TicketForm />} />
        <Route path="/mis-tickets" element={<TicketList viewType="CLIENT" />} />

        {/* STAFF */}
        <Route path="/bandeja-entrada" element={<TicketList viewType="AVAILABLE" />} />
        <Route path="/mis-casos" element={<TicketList viewType="MINE" />} />
        <Route path="/tickets-global" element={<TicketList viewType="ALL" />} />
        
        {/* DETALLE */}
        <Route path="/tickets/:id" element={<TicketDetail />} />
        
        {/* ADMIN */}
        {user?.role === "ADMIN" && (
           <>
             {/* 👇 3. CORREGIMOS EL NOMBRE: '/alta-personal' para que coincida con el Sidebar */}
             <Route path="/alta-personal" element={<CreateSupport />} />
             <Route path="/usuarios" element={<UserList />} />
           </>
        )}

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}