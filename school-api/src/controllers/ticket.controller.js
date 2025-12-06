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
      createdBy: req.user.id // Viene del token (auth middleware)
    });

    res.status(201).json(ticket);
  } catch (err) {
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
    res.status(500).json({ msg: "Error obteniendo tickets" });
  }
}

// Actualizar ticket (Asignar, cambiar estado, resolver)
export async function updateTicket(req, res) {
  try {
    // Aquí podrías validar que solo SUPPORT/ADMIN haga esto
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!ticket) return res.status(404).json({msg: "Ticket no encontrado"});
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ msg: "Error actualizando ticket" });
  }
}