import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js";

// Crear un ticket
export async function createTicket(req, res) {
  try {
    const { title, description, department, priority } = req.body;

    // Gestión de archivo adjunto
    const attachment = req.file ? `/uploads/${req.file.filename}` : null;

    // Lógica de prioridad automática
    let finalPriority = priority;
    const textoCompleto = (title + " " + description).toLowerCase();

    if (
      textoCompleto.includes("fuego") || 
      textoCompleto.includes("humo") || 
      textoCompleto.includes("servidor caído") ||
      textoCompleto.includes("hackeado")
    ) {
        finalPriority = "CRITICA";
    } else if (
      textoCompleto.includes("urgente") || 
      textoCompleto.includes("error critico") || 
      textoCompleto.includes("fallo total") ||
      textoCompleto.includes("sin sistema")
    ) {
        finalPriority = "ALTA";
    }

    const ticket = await Ticket.create({
      title,
      description,
      department,
      priority: finalPriority,
      attachment,
      createdBy: req.user.id,
      status: "ABIERTO"
    });

    res.status(201).json(ticket);

  } catch (err) {
    console.error("Error creando ticket:", err);
    res.status(500).json({ msg: "Error creando ticket" });
  }
}

// Obtener tickets
export async function getTickets(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let filtro = {};

    if (userRole === "CLIENT") {
      filtro.createdBy = userId;
    } else if (userRole === "SUPPORT") {
      const agent = await User.findById(userId);
      const myDept = agent.department || "SOPORTE GENERAL";
      filtro = {
        $or: [
          { assignedTo: userId },
          { assignedTo: null, department: myDept }
        ]
      };
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

// Actualizar ticket
export async function updateTicket(req, res) {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
      .populate("assignedTo", "email firstName lastName");
      // Si tienes comentarios, descomenta esto:
      // .populate({ path: "comments", ... });

    if (!ticket) return res.status(404).json({ msg: "Ticket no encontrado" });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error obteniendo ticket" });
  }
}

// Eliminar ticket
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

// 👇 NUEVA FUNCIÓN: ESTADÍSTICAS DEL DASHBOARD
export async function getTicketStats(req, res) {
  try {
    // Cuenta documentos según su estado
    const total = await Ticket.countDocuments();
    const pending = await Ticket.countDocuments({ status: "ABIERTO" }); 
    const inProcess = await Ticket.countDocuments({ status: "EN_PROCESO" });
    const resolved = await Ticket.countDocuments({ status: "RESUELTO" }); // O "CERRADO" según uses en tu BD

    res.json({
      total,
      pending,
      inProcess,
      resolved
    });
  } catch (error) {
    console.error("Error stats:", error);
    res.status(500).json({ msg: "Error obteniendo estadísticas" });
  }
}