import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// 1. IMPORTAR SEGURIDAD
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import mongoSanitize from "express-mongo-sanitize"; // 👈 COMENTADO TEMPORALMENTE PARA CORREGIR EL ERROR 500

// Rutas
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚡ IMPORTANTE PARA NGINX:
// Permite que el Rate Limit vea la IP real del usuario y no la de Nginx
app.set('trust proxy', 1);

// 2. MIDDLEWARES BÁSICOS
app.use(cors({
    origin: ["http://localhost:5173", "https://northcode-soporte.duckdns.org"], 
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// 3. CONFIGURAR SEGURIDAD
app.use(helmet({
  crossOriginResourcePolicy: false, // Permite cargar imágenes cruzadas
}));

// app.use(mongoSanitize()); //  DESHABILITADO POR AHORA

// Rate Limiting: Máximo 150 peticiones por 15 min por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  standardHeaders: true,
  legacyHeaders: false,
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos."
});
app.use("/api/", limiter);

// Archivos estáticos (Imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

export default app;