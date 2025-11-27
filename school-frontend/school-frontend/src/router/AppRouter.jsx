// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import Login from "../pages/Login";
import RegisterTeacher from "../pages/RegisterTeacher";
import Layout from "../components/Layout";

// Páginas de ADMIN
import Dashboard from "../pages/Dashboard";
import Alumnos from "../pages/Alumnos";
import Cursos from "../pages/Cursos";
import Grupos from "../pages/Grupos";
import Inscripciones from "../pages/Inscripciones";
import Calificaciones from "../pages/Calificaciones";
import Docentes from "../pages/Docentes";
import HistorialAlumno from "../pages/HistorialAlumno";

// Páginas de DOCENTE
import PanelDocente from "../pages/PanelDocente";
import ReporteGrupo from "../pages/ReporteGrupo";

export default function AppRouter() {
  const { usuario } = useContext(AuthContext);

  return (
    <Routes>
      {/* 1. USUARIO NO LOGUEADO (Público) */}
      {!usuario ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register-teacher" element={<RegisterTeacher />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        /* 2. USUARIO LOGUEADO (Privado) */
        <Route element={<Layout />}>
          
          {/* === RUTAS EXCLUSIVAS DE ADMIN === */}
          {usuario.role === "ADMIN" && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alumnos" element={<Alumnos />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/grupos" element={<Grupos />} />
              <Route path="/inscripciones" element={<Inscripciones />} />
              <Route path="/calificaciones" element={<Calificaciones />} />
              <Route path="/docentes" element={<Docentes />} />
              <Route path="/alumnos/:id/historial" element={<HistorialAlumno />} />
            </>
          )}

          {/* === RUTAS COMUNES O DE DOCENTE === */}
          {/* El Panel Docente es la "Home" de los maestros */}
          <Route path="/panel-docente" element={<PanelDocente />} />
          <Route path="/grupos/:id/reporte" element={<ReporteGrupo />} />

          {/* REDIRECCIÓN INTELIGENTE:
             Si entran a una ruta desconocida (o prohibida):
             - Si es ADMIN -> va al Dashboard general
             - Si es DOCENTE -> va al Panel Docente
          */}
          <Route 
            path="*" 
            element={<Navigate to={usuario.role === "ADMIN" ? "/" : "/panel-docente"} />} 
          />
        </Route>
      )}
    </Routes>
  );
}