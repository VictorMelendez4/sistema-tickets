import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import Login from "../pages/Login";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import TicketForm from "../pages/TicketForm";
import TicketList from "../pages/TicketList";
import Register from "../pages/Register";

export default function AppRouter() {
  const { usuario } = useContext(AuthContext);

  return (
    <Routes>
      {!usuario ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
        </>
      ) : (
        <Route element={<Layout />}>
          {/* Rutas Comunes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/mis-tickets" element={<TicketList />} />
          
          {/* Solo Clientes pueden crear */}
          {usuario.role === "CLIENT" && (
            <Route path="/nuevo-ticket" element={<TicketForm />} />
          )}

          {/* Solo Soporte/Admin ven todos */}
          {(usuario.role === "ADMIN" || usuario.role === "SUPPORT") && (
            <Route path="/gestion-tickets" element={<TicketList />} />
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
}