import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";
// import mongoSanitize from "express-mongo-sanitize"; // Mantenlo comentado por ahora
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. CORS (EL PORTERO) - ¡VA PRIMERO!
// ==========================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",       // Frontend Local
      "http://127.0.0.1:5173",       // Frontend Local (Variante)
      "http://159.54.142.179"        // Servidor Producción
    ],
    credentials: true,               // Permite cookies/tokens
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// 2. CONFIGURACIONES BÁSICAS
// ==========================================
app.use(express.json());
app.use(morgan("dev"));

// Rate limiting (Opcional, mantenlo si quieres)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas peticiones desde esta IP.",
});
app.use("/api/", limiter);

// app.use(mongoSanitize()); // Comentado para evitar errores de versión

app.get("/", (req, res) => {
  res.json({ msg: "API Funcionando 🚀" });
});

// ==========================================
// 3. RUTAS
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);

export default app;