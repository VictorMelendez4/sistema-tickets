import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { api } from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función segura para guardar usuario
  const setAuthData = (userData) => {
    // 🛡️ Aseguramos que siempre tenga campos básicos para evitar crash
    const safeUser = {
        ...userData,
        firstName: userData.firstName || "Usuario",
        lastName: userData.lastName || "",
        role: userData.role || "CLIENT"
    };
    setUser(safeUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(safeUser));
  };

  const signup = async (user) => {
    try {
      const res = await api.post("/auth/register", user);
      setAuthData(res.data.user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      // Soportamos ambas estructuras de respuesta por seguridad
      const userData = res.data.user || res.data;
      setAuthData(userData);
      return userData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      Cookies.remove("token");
      localStorage.removeItem("user"); // Borramos datos viejos
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Verificar sesión al cargar la página
  useEffect(() => {
    const checkLogin = async () => {
      const cookies = Cookies.get();
      const storedUser = localStorage.getItem("user");

      if (!cookies.token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Intentamos verificar con el backend
        const res = await api.get("/auth/verify");
        if (!res.data) throw new Error("Token inválido");
        setAuthData(res.data);
      } catch (error) {
        // Si falla el backend pero tenemos datos locales, los usamos temporalmente
        // para no sacar al usuario bruscamente (Fail-safe)
        if (storedUser) {
           try {
             setAuthData(JSON.parse(storedUser));
           } catch (e) {
             setIsAuthenticated(false);
             setUser(null);
           }
        } else {
           setIsAuthenticated(false);
           setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signup,
        login,
        logout,
        user,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};