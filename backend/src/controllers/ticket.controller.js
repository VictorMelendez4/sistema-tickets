import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js"; // Necesitamos importar User para ver el depto del agente

// Crear un ticket (Solo CLIENT)
export async function createTicket(req, res) {
  try {
    let { title, description, department, priority } = req.body;

    // --- 🤖 LÓGICA DE PRIORIDAD AUTOMÁTICA ---
    const textoCompleto = (title + " " + description).toLowerCase();
    
    // Palabras clave para urgencia
    if (textoCompleto.includes("fuego") || textoCompleto.includes("humo") || textoCompleto.includes("servidor caído")) {
        priority = "CRITICA";
    } else if (textoCompleto.includes("urgente") || textoCompleto.includes("error") || textoCompleto.includes("fallo")) {
        priority = "ALTA";
    }
    // ------------------------------------------

    const ticket = await Ticket.create({
      title,
      description,
      department,
      priority, // Se guarda la prioridad calculada o la manual
      createdBy: req.user.id,
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error("Error creando ticket:", err);
    res.status(500).json({ msg: "Error creando ticket" });
  }
}

// Obtener tickets con FILTRO INTELIGENTE
export async function getTickets(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filtro = {};

    // 1. Si es CLIENTE: Solo ve los suyos
    if (userRole === "CLIENT") {
      filtro.createdBy = userId;
    }
    // 2. Si es SOPORTE: Ve los suyos + los vacíos de su departamento
    else if (userRole === "SUPPORT") {
      // Primero buscamos al usuario en la BD para saber su departamento real
      const agent = await User.findById(userId);
      const myDept = agent.department || "SOPORTE GENERAL";

      filtro = {
        $or: [
          { assignedTo: userId },             // 1. Los que ya tomé
          { assignedTo: null, department: myDept } // 2. Los libres de mi área
        ]
      };
    }
    // 3. Si es ADMIN: El filtro se queda vacío {} y ve TODO.

    const tickets = await Ticket.find(filtro)
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 }); // Los más nuevos primero

    res.json(tickets);
  } catch (err) {
    console.error("Error obteniendo tickets:", err);
    res.status(500).json({ msg: "Error obteniendo tickets" });
  }
}

// Actualizar ticket
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

// Obtener un solo ticket
export async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "email firstName lastName")
      .populate("assignedTo", "email firstName lastName")
      .populate({
        path: "comments",
        options: { sort: { createdAt: 1 } },
        populate: { path: "author", select: "firstName lastName email role" },
      });

    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error obteniendo ticket" });
  }
}

// Eliminar ticket (Solo Admin)
export async function deleteTicket(req, res) {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });
    res.json({ msg: "Ticket eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error eliminando ticket" });
  }
}