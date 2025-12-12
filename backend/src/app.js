import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// 1. IMPORTAR SEGURIDAD
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// Rutas
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. CONFIGURAR SEGURIDAD

// Helmet: Protege cabeceras HTTP (Permitimos carga de imágenes cruzada para evitar conflictos)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Mongo Sanitize: Evita inyecciones NoSQL básicas
app.use(mongoSanitize());

// Rate Limiting: Máximo 150 peticiones por 15 min por IP (Anti fuerza bruta)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  standardHeaders: true,
  legacyHeaders: false,
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos."
});
// Aplicamos el límite solo a las rutas que empiezan con /api
app.use("/api/", limiter);

// Middlewares estándar
app.use(cors({
    origin: ["http://localhost:5173", "https://northcode-soporte.duckdns.org"], 
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Archivos estáticos (Imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

export default app;