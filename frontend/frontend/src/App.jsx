import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast"; // 👈 IMPORTANTE: Importar librería

function App() {
  return (
    <AuthProvider>
      {/* El Router maneja las páginas */}
      <AppRouter />
      
      {/* 👇 Esto permite que salgan las notificaciones bonitas */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#333', color: '#fff' },
          success: { style: { background: '#d4edda', color: '#155724' } },
          error: { style: { background: '#f8d7da', color: '#721c24' } },
        }}
      />
    </AuthProvider>
  );
}

export default App;