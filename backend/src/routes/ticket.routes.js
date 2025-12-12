import { Router } from "express";
// Importamos la nueva función getTicketStats
import { 
  createTicket, 
  getTickets, 
  getTicket, 
  updateTicket, 
  deleteTicket, 
  getTicketStats 
} from "../controllers/ticket.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js"; // 👈 NECESARIO PARA IMÁGENES

const router = Router();

// Protegemos todas las rutas
router.use(protect);

// 1. Rutas generales
router.route("/")
  .post(upload.single("image"), createTicket) // 👈 Aquí va el middleware de imagen
  .get(getTickets);

// 2. Ruta de Estadísticas (¡IMPORTANTE! Debe ir ANTES de /:id)
router.get("/stats/general", authorize("ADMIN", "SUPPORT"), getTicketStats);

// 3. Rutas específicas por ID
router.route("/:id")
  .get(getTicket)
  .put(updateTicket)
  .delete(authorize("ADMIN", "SUPPORT"), deleteTicket);

// Si tienes comentarios, descomenta esto cuando crees el controlador:
// router.route("/:id/comments").post(addComment);

export default router;