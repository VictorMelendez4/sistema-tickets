import { Router } from "express";
import { createTicket, getTickets, getTicket, updateTicket, deleteTicket } from "../controllers/ticket.controller.js";
import { auth } from "../middlewares/auth.js";
import multer from "multer"; // <--- IMPORTANTE
import path from "path";

const router = Router();

// 1. CONFIGURACIÓN DE MULTER (Dónde guardar)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Guardar en carpeta 'uploads'
  },
  filename: (req, file, cb) => {
    // Nombre único: fecha + extensión (ej: 123456789.png)
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage });

// 2. RUTAS
// Notar el 'upload.single("file")' -> Espera un campo llamado 'file'
router.post("/", auth, upload.single("file"), createTicket);

router.get("/", auth, getTickets);
router.get("/:id", auth, getTicket);
router.put("/:id", auth, updateTicket);
router.delete("/:id", auth, deleteTicket);

export default router;