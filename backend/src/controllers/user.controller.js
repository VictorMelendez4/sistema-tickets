import { User } from "../models/User.js";
import bcrypt from "bcryptjs"; // 👈 NECESARIO PARA CREAR USUARIOS

// 1. OBTENER TODOS LOS USUARIOS (Dashboard de Personal)
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener usuarios" });
  }
}

// 2. ACTUALIZAR ROL DE USUARIO
export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Error actualizando usuario" });
  }
}

// 3. ELIMINAR USUARIO
export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error eliminando usuario" });
  }
}

// 👇 4. NUEVA: CREAR PERSONAL (Desde el Panel Admin)
export async function createStaff(req, res) {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "El usuario ya existe" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role: role || "SUPPORT", // Por defecto Soporte si no se especifica
      department
    });

    res.status(201).json({ msg: "Personal creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando personal" });
  }
}

// 👇 5. NUEVA: MÉTRICAS PARA EL DASHBOARD
export const getStaffMetrics = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const support = await User.countDocuments({ role: "SUPPORT" });
    const admins = await User.countDocuments({ role: "ADMIN" });
    const clients = await User.countDocuments({ role: "CLIENT" });

    res.json({
      total,
      support,
      admins,
      clients
    });
  } catch (error) {
    console.error("Error metrics:", error);
    res.status(500).json({ msg: "Error obteniendo métricas" });
  }
};