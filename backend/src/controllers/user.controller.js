import { User } from "../models/User.js";

// 1. OBTENER TODOS LOS USUARIOS (Sin password)
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
    const { role } = req.body; // Esperamos { role: "SUPPORT" } o "ADMIN"
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