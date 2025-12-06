import axios from "axios";

export const api = axios.create({
  baseURL: "/api",         
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; // opcional, por si en algún lado lo importas por default
