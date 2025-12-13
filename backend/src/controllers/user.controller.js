import { User } from "../models/User.js";
import { Ticket } from "../models/Ticket.js";
import bcrypt from "bcryptjs";

// 1. OBTENER TODOS LOS USUARIOS
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener usuarios" });
  }
}

// 2. CREAR STAFF (Admin)
export async function createStaff(req, res) {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "El usuario ya existe" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      firstName, lastName, email,
      passwordHash: hashedPassword,
      role: role || "SUPPORT",
      department
    });
    res.status(201).json({ msg: "Personal creado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error creando personal" });
  }
}

// 3. ACTUALIZAR / BORRAR
export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (error) { res.status(500).json({ msg: "Error" }); }
}
export async function deleteUser(req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Eliminado" });
  } catch (error) { res.status(500).json({ msg: "Error" }); }
}

// ⭐ 4. MÉTRICAS AVANZADAS Y RANKINGS (Dashboard)
export const getStaffMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const supportAgents = await User.countDocuments({ role: "SUPPORT" });

    // Lógica de Rankings (Agrupa por agente, cuenta resueltos y promedia calificación)
    const rankingData = await Ticket.aggregate([
        { $match: { status: { $in: ["RESUELTO", "CERRADO"] } } },
        { $group: { 
            _id: "$assignedTo", 
            count: { $sum: 1 }, 
            avgRating: { $avg: "$rating" } 
        }},
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "agent" } },
        { $unwind: "$agent" },
        { $project: { 
            name: { $concat: ["$agent.firstName", " ", "$agent.lastName"] }, 
            department: "$agent.department", 
            count: 1, 
            avgRating: 1 
        }},
        { $sort: { avgRating: -1, count: -1 } } // Ordenar por mejor calificación
    ]);

    // Top Empleado (El primero de la lista)
    const topEmployee = rankingData.length > 0 ? {
        name: rankingData[0].name,
        ticketsSolved: rankingData[0].count,
        rating: rankingData[0].avgRating?.toFixed(1)
    } : null;

    // Meta Mensual
    const currentMonthTickets = await Ticket.countDocuments({
        status: { $in: ["RESUELTO", "CERRADO"] },
        updatedAt: { $gte: new Date(new Date().setDate(1)) }
    });

    res.json({
      total: totalUsers,
      support: supportAgents,
      topEmployee,
      monthlyGoal: { target: 50, current: currentMonthTickets },
      rankingGlobal: rankingData, // Enviamos toda la lista para filtrar en el front
      avgResolutionTimeGlobal: 125,
      myAvgResolutionTime: 98
    });

  } catch (error) {
    console.error("Error metrics:", error);
    res.status(500).json({ msg: "Error métricas" });
  }
};

// ⭐ 5. NUEVA: ESTADÍSTICAS PERSONALES (Para el Perfil)
export const getMyStats = async (req, res) => {
    try {
        const userId = req.user.id; // El ID viene del token
        
        const solved = await Ticket.countDocuments({ assignedTo: userId, status: { $in: ["RESUELTO", "CERRADO"] } });
        const pending = await Ticket.countDocuments({ assignedTo: userId, status: { $in: ["ABIERTO", "EN_PROCESO"] } });
        
        // Calcular promedio de estrellas
        const ratings = await Ticket.find({ assignedTo: userId, rating: { $gt: 0 } }).select("rating");
        const avg = ratings.length > 0 
            ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
            : "N/A";

        res.json({ solved, pending, rating: avg });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error stats perfil" });
    }
};
// ⭐ 6. OBTENER LISTA DE AGENTES (Para asignar tickets)
export const getSupportAgents = async (req, res) => {
    try {
        // Buscamos a todos los que sean SUPPORT o ADMIN
        const agents = await User.find({ role: { $in: ["SUPPORT", "ADMIN"] } })
                                 .select("firstName lastName email role");
        res.json(agents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error obteniendo agentes" });
    }
};