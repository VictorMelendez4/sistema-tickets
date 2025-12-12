import { createContext, useState, useEffect, useContext } from "react";
import { api } from "../api/axios";
import Cookies from "js-cookie"; // Asegúrate de tener instalado js-cookie, si no, usa la lógica manual

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  //  FUNCIÓN CORREGIDA: Solo guardamos el usuario, no el token (el token va en cookie)
  const setAuthData = (userData) => {
    try {
        if (!userData) return;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    } catch (error) {
        console.error("Error guardando sesión:", error);
    }
  };

  //  CARGA BLINDADA: No explota si hay basura en el navegador
  useEffect(() => {
    async function checkLogin() {
      const storedUser = localStorage.getItem("user");

      // Validación extra: Si es null, vacío o la palabra "undefined"
      if (!storedUser || storedUser === "undefined") {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Intentamos convertir el texto a objeto
        const parsedUser = JSON.parse(storedUser);
        
        // Si funcionó, restauramos la sesión visualmente
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // (Opcional) Aquí podrías verificar con el backend si la cookie sigue viva
        // await api.get('/auth/verify'); 

      } catch (error) {
        // Si falla (JSON inválido), limpiamos la basura automáticamente
        console.warn("Sesión corrupta detectada. Limpiando...");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

 const login = async (email, password) => {
    // 1. Recibimos la "caja" completa del backend
    const { data } = await api.post("/auth/login", { email, password });
    
    // 2. CORRECCIÓN: Sacamos solo el usuario de adentro
    // Tu backend devuelve: { status: "success", user: { ...datos... } }
    if (data.user) {
        setAuthData(data.user); // Guardamos solo los datos limpios
        return data.user;
    } 
    
    // (Por seguridad, si algún día cambia el backend)
    setAuthData(data);
    return data;
  };

  const logout = async () => {
    try {
        await api.post("/auth/logout"); // Avisar al backend para borrar cookie
    } catch (error) {
        console.error(error);
    }
    localStorage.removeItem("user"); // Borrar datos locales
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
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}