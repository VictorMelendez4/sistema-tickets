import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { createTicket, getTickets, updateTicket, getTicket, deleteTicket } from "../controllers/ticket.controller.js";

const router = Router();

router.use(auth); // Todo requiere login

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicket);
router.put("/:id", updateTicket);
router.delete("/:id", auth, deleteTicket);

export default router;