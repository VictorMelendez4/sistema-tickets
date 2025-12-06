import { Ticket } from "../models/Ticket.js";

// Crear un ticket (Solo CLIENT)
export async function createTicket(req, res) {
  try {
    const { title, description, category, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user.id, // viene del token
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error("Error creando ticket:", err);
    res.status(500).json({ msg: "Error creando ticket" });
  }
}

// Obtener mis tickets (CLIENT) o todos (ADMIN/SUPPORT)
export async function getTickets(req, res) {
  try {
    let filtro = {};

    // Si NO es soporte ni admin, solo ve sus propios tickets
    if (req.user.role === "CLIENT") {
      filtro.createdBy = req.user.id;
    }

    const tickets = await Ticket.find(filtro)
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error("Error obteniendo tickets:", err);
    res.status(500).json({ msg: "Error obteniendo tickets" });
  }
}

// Actualizar ticket (Asignar, cambiar estado, resolver)
export async function updateTicket(req, res) {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });
    res.json(ticket);
  } catch (err) {
    console.error("Error actualizando ticket:", err);
    res.status(500).json({ msg: "Error actualizando ticket" });
  }
}

// Obtener un solo ticket por ID (con historial de comentarios)
export async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "email firstName lastName")
      .populate("assignedTo", "email firstName lastName")
      .populate({
        path: "comments",
        options: { sort: { createdAt: 1 } }, // comentarios más viejos primero
        populate: {
          path: "author",
          select: "firstName lastName email role",
        },
      });

    if (!ticket) {
      return res.status(404).json({ msg: "Ticket no encontrado" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Error obteniendo ticket:", err);
    res.status(500).json({ msg: "Error obteniendo ticket" });
  }
}
