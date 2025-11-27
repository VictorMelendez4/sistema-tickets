import { createContext, useState, useEffect } from "react";
import { api } from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función interna para guardar datos en LocalStorage y Estado
  const setAuthData = (user, token) => {
    setUsuario(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // Restaurar sesión del localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      // Restauramos el token en axios para que las peticiones funcionen
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUsuario(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // ---- LOGIN (Hace la petición a la API) ----
  async function login(email, password) {
    // 1. Hacemos la petición
    const { data } = await api.post("/auth/login", { email, password });
    
    // 2. Usamos nuestra función auxiliar para guardar
    setAuthData(data.user, data.token);
  }

  // ---- LOGOUT ----
  function logout() {
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, setAuthData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}