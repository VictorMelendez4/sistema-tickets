import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { createTicket, getTickets, updateTicket, getTicket } from "../controllers/ticket.controller.js";

const router = Router();

router.use(auth); // Todo requiere login

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicket);
router.put("/:id", updateTicket);

export default router;