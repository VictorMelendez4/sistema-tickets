import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

// Generar Token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "SECRET_KEY",
    { expiresIn: "7d" }
  );
}

// 1) Login (Público)
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Credenciales incorrectas" });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Credenciales incorrectas" });

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department // Enviamos el depto también
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Error en login" });
  }
}

// 2) Registro de Clientes (Público)
export async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "El correo ya está registrado" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash: hash,
      firstName,
      lastName,
      role: "CLIENT" // Siempre es CLIENTE aquí
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: "Error en registro" });
  }
}

// 3) CREAR STAFF (Solo Admin - Protegido) <--- ¡ESTA ES LA NUEVA!
export async function createStaff(req, res) {
  try {
    // Recibimos datos + el departamento
    const { email, password, firstName, lastName, department } = req.body;

    // Verificar si ya existe
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "El correo ya existe" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Creamos el usuario forzando el rol SUPPORT
    const newStaff = await User.create({
      email,
      passwordHash: hash,
      firstName,
      lastName,
      role: "SUPPORT", // <--- Forzado
      department: department || "SOPORTE GENERAL"
    });

    res.status(201).json({ msg: "Agente creado exitosamente", staff: newStaff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear staff" });
  }
}

// 4) Obtener Agentes (Para listas)
export async function getSupportAgents(req, res) {
  try {
    const agents = await User.find({ role: { $in: ["SUPPORT", "ADMIN"] } })
      .select("firstName lastName email role department");
    res.json(agents);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener agentes" });
  }
}