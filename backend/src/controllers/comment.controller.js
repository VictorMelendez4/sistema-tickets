import { Comment } from "../models/Comment.js";
import { Ticket } from "../models/Ticket.js";

export const addComment = async (req, res) => {
  try {
    const { content, ticketId, isInternal } = req.body;

    // Validación básica
    if (!content || !ticketId) {
      return res.status(400).json({ msg: "Faltan datos requeridos" });
    }

    // Verificar que el ticket exista
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ msg: "Ticket no encontrado" });
    }

    // Crear el comentario
    const newComment = new Comment({
      content,
      ticket: ticketId,
      author: req.user.id, // Esto falla si falta el middleware 'auth' en la ruta
      isInternal: isInternal || false
    });

    const savedComment = await newComment.save();

    // Agregar referencia al ticket
    ticket.comments.push(savedComment._id);
    await ticket.save();

    // Poblar datos del autor para devolverlo al frontend
    const populatedComment = await Comment.findById(savedComment._id)
      .populate("author", "firstName lastName email role");

    res.status(201).json(populatedComment);

  } catch (error) {
    console.error("Error al crear comentario:", error); // <--- Mira tu terminal backend para ver este error
    res.status(500).json({ msg: "Error al crear comentario" });
  }
};