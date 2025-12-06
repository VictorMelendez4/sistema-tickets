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

// Obtener un solo ticket por ID (con historial de comentarios)
export async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "email firstName lastName")
      .populate("assignedTo", "email firstName lastName")
      .populate({
        path: "comments",
        options: { sort: { createdAt: 1 } },  // Orden ascendente
        populate: {
          path: "author",
          select: "firstName lastName email role" // Autor del comentario
        }
      });

    if (!ticket) {
      return res.status(404).json({ msg: "Ticket no encontrado" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Error en getTicket:", err);
    res.status(500).json({ msg: "Error obteniendo ticket" });
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

// Obtener un solo ticket por ID
export async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "email firstName lastName")
      .populate("assignedTo", "email firstName lastName");

    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo ticket" });
  }
}