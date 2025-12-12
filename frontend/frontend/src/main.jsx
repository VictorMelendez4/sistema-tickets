import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // Importamos App (que trae el Toaster)

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Usamos App, que ya incluye AuthProvider y Toaster internamente */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);