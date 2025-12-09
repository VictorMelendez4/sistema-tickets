// src/api/axios.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://159.54.142.179/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Opcional pero útil: meter el token automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
