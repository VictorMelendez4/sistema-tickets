import { createContext, useState, useEffect, useContext } from "react";
import { api } from "../api/axios";

// 1. Exportamos el Contexto
export const AuthContext = createContext();

// 2. Exportamos el Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

// 3. El Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- FUNCIÓN QUE TE FALTABA ---
  // Esta función permite guardar la sesión manualmente (ej. tras registro)
  const setAuthData = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };
  // -----------------------------

  // Cargar sesión al iniciar la app
  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Opcional: Verificar token con backend aquí.
        // Por ahora confiamos en localStorage para rapidez.
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  // Función de Login normal
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAuthData(data.user, data.token); // Reutilizamos la función interna
    return data; // Devolvemos data por si el componente la necesita
  };

  // Función de Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        loading,
        setAuthData, // <--- ¡AQUÍ ESTABA EL ERROR! Faltaba exportar esto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}