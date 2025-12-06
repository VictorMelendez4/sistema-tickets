import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

const app = express();

// 1. Rate Limiting (Evita ataques de fuerza bruta)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 peticiones por IP
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos."
});
app.use("/api/", limiter);

// 2. Sanitización (Evita inyección NoSQL)
app.use(mongoSanitize());

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ msg: "School API OK" });
});

app.use("/api/auth", authRoutes);

app.use("/api/tickets", ticketRoutes);



export default app;
