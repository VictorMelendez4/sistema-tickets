// src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Teacher } from "../models/Teacher.js";

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
    const user = await User.findOne({ email }).populate("teacher");
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
        teacher: user.teacher ? {
          id: user.teacher._id,
          firstName: user.teacher.firstName,
          lastName: user.teacher.lastName,
        } : null,
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
// 3) Registrar DOCENTE
// =========================
export async function registerTeacher(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      status,        // por si lo usas: "ACTIVO"/"INACTIVO"
      specialty,     // array de strings opcional
    } = req.body;

    // 1. Verificar si ya existe un usuario con ese email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Ya existe un usuario con ese correo" });
    }

    // 2. Crear Teacher
    const teacher = await Teacher.create({
      firstName,
      lastName,
      employeeId: `DOC-${Date.now()}`, // Generar ID único
      phone: phone || "",
      emailInst: email,
      specialty: specialty || [],
    });

    // 3. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 4. Crear User vinculado al Teacher
    const user = await User.create({
      email,
      passwordHash: hash,
      role: "TEACHER",
      teacher: teacher._id,
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        teacher: {
          id: teacher._id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
        },
      },
    });
  } catch (err) {
    console.error("REGISTER TEACHER ERROR:", err);
    return res.status(500).json({
      msg: "Error registrando docente",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
