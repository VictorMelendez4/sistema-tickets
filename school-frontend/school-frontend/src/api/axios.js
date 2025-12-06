import axios from "axios";

export const api = axios.create({
  baseURL: "http://159.54.142.179/api",
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
