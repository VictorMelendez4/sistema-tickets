import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. REGISTRO DE CLIENTES
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      // 👇 CAMBIO IMPORTANTE: Guardamos como 'passwordHash'
      passwordHash: hashedPassword, 
      role: "CLIENT"
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al registrar usuario" });
  }
};

// 2. INICIO DE SESIÓN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Por favor ingrese email y contraseña" });
    }

    // 👇 CAMBIO IMPORTANTE: Pedimos '+passwordHash'
    const user = await User.findOne({ email }).select("+passwordHash");
    
    // Debug para estar seguros (puedes borrarlo luego)
    console.log("Usuario login:", user); 

    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // 👇 CAMBIO IMPORTANTE: Comparamos contra 'user.passwordHash'
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// 3. OBTENER AGENTES
export const getSupportAgents = async (req, res) => {
  try {
    const agents = await User.find({ 
        $or: [{ role: "SUPPORT" }, { role: "ADMIN" }] 
    }).select("firstName lastName email role");
    res.json(agents);
  } catch (error) {
    res.status(500).json({ msg: "Error obteniendo agentes" });
  }
};

// 4. CREAR STAFF
export const createStaff = async (req, res) => {
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
        // 👇 CAMBIO IMPORTANTE
        passwordHash: hashedPassword,
        role,
        department
      });
  
      res.status(201).json({ msg: "Personal creado correctamente" });
    } catch (error) {
      res.status(500).json({ msg: "Error creando personal" });
    }
};

// 5. ACTUALIZAR CONTRASEÑA
export const updatePassword = async (req, res) => {
    try {
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: "Mínimo 6 caracteres" });
      }
  
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
      
      const salt = await bcrypt.genSalt(10);
      // 👇 CAMBIO IMPORTANTE
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      res.json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error actualizando contraseña" });
    }
};