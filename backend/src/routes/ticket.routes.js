import { Router } from "express";
import { createTicket, getTickets, getTicket, updateTicket, deleteTicket, addComment } from "../controllers/ticket.controller.js";
// 👇 CAMBIO IMPORTANTE: Usamos el nuevo middleware
import { protect, authorize } from "../middlewares/auth.middleware.js"; 

const router = Router();

// Protegemos todas las rutas de aquí para abajo
router.use(protect);

router.route("/")
  .post(createTicket)
  .get(getTickets);

router.route("/:id")
  .get(getTicket)
  .put(updateTicket)
  .delete(authorize("ADMIN", "SUPPORT"), deleteTicket);

router.route("/:id/comments")
  .post(addComment);

export default router;