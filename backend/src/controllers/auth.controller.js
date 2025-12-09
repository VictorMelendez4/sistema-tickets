// src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";


// =========================
// Función auxiliar: crear token
// =========================
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET || "SECRET_KEY",
    {
      expiresIn: "7d",
    }
  );
}

// =========================
// 1) Login
// =========================
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("LOGIN: usuario no encontrado");
      return res.status(400).json({ msg: "Credenciales incorrectas" });
    }

    // Comparar password con hash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log("LOGIN: contraseña incorrecta");
      return res.status(400).json({ msg: "Credenciales incorrectas" });
    }

    const token = generateToken(user);

    return res.json({
    token,
    user: {
    id: user._id,
    email: user.email,
    role: user.role,
  },
});

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Error en login" });
  }
}

// =========================
// 2) Registrar ADMIN (solo para sembrar 1 vez)
// =========================
export async function registerAdmin(req, res) {
  try {
    const { email, password } = req.body;

    // opcional: evitar múltiples admins con mismo correo
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "Ya existe un usuario con ese correo" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash: hash,
      role: "ADMIN",
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ADMIN ERROR:", err);
    return res
      .status(500)
      .json({ msg: "Error registrando admin", error: err.message });
  }
}

// =========================
// 3) Registrar 
// =========================
export async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Verificar si existe
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "El correo ya está registrado" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Crear Usuario (Por defecto es CLIENT)
    const user = await User.create({
      email,
      passwordHash: hash,
      firstName,
      lastName,
      role: "CLIENT" 
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error en registro", error: err.message });
  }
}

// Obtener lista de usuarios que son SOPORTE o ADMIN (para asignar tickets)
export async function getSupportAgents(req, res) {
  try {
    // Buscamos usuarios cuyo rol sea SUPPORT o ADMIN
    const agents = await User.find({ role: { $in: ["SUPPORT", "ADMIN"] } })
      .select("firstName lastName email role"); // Solo traemos datos necesarios
    
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener agentes" });
  }
}