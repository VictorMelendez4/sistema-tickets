import { User } from "../models/User.js";
import { Ticket } from "../models/Ticket.js"; // Necesitamos esto para calcular métricas
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

// 3. ACTUALIZAR / BORRAR (Básicos)
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

// ⭐ 4. MÉTRICAS AVANZADAS (Ranking y Tiempos)
export const getStaffMetrics = async (req, res) => {
  try {
    // A. Conteo básico de personal
    const totalUsers = await User.countDocuments();
    const supportAgents = await User.countDocuments({ role: "SUPPORT" });

    // B. Calcular "Mejor Empleado" (El que tenga más tickets cerrados este mes)
    // Nota: Esto es una simplificación. En un sistema real sería más complejo.
    const topEmployee = await Ticket.aggregate([
        { $match: { status: { $in: ["RESUELTO", "CERRADO"] } } },
        { $group: { _id: "$assignedTo", count: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);
    
    let topEmployeeData = null;
    if (topEmployee.length > 0 && topEmployee[0]._id) {
        const user = await User.findById(topEmployee[0]._id).select("firstName lastName");
        if (user) {
            topEmployeeData = {
                name: `${user.firstName} ${user.lastName}`,
                ticketsSolved: topEmployee[0].count,
                rating: topEmployee[0].avgRating?.toFixed(1) || "N/A"
            };
        }
    }

    // C. Calcular Meta Mensual (Ejemplo: Meta fija de 100 tickets)
    const currentMonthTickets = await Ticket.countDocuments({
        status: { $in: ["RESUELTO", "CERRADO"] },
        updatedAt: { $gte: new Date(new Date().setDate(1)) } // Desde el día 1 del mes
    });

    res.json({
      total: totalUsers,
      support: supportAgents,
      topEmployee: topEmployeeData,
      monthlyGoal: { target: 50, current: currentMonthTickets }, // Meta de ejemplo
      avgResolutionTimeGlobal: 125, // Ejemplo estático (minutos)
      myAvgResolutionTime: 98       // Ejemplo estático
    });

  } catch (error) {
    console.error("Error metrics:", error);
    res.status(500).json({ msg: "Error métricas" });
  }
};