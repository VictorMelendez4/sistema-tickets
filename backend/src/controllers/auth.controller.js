import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Función auxiliar para crear la cookie
const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Opciones de la cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 día
    httpOnly: true, // 🛡️ Seguridad: No accesible por JS del frontend
    secure: true,   // 🛡️ Seguridad: Solo viaja por HTTPS
    sameSite: 'none' // Necesario para cross-site (o 'lax' si es mismo dominio)
  };

  // 👇 ¡AQUÍ ESTÁ LA MAGIA! Enviamos la cookie
  res.cookie("token", token, cookieOptions);

  // Enviamos respuesta JSON (sin el token visible, ya va en la cookie)
  res.status(statusCode).json({
    status: "success",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
};

// 1. REGISTRO
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
      passwordHash: hashedPassword,
      role: "CLIENT"
    });

    // Usamos la función auxiliar
    createSendToken(newUser, 201, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al registrar usuario" });
  }
};

// 2. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Ingrese email y contraseña" });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // Usamos la función auxiliar
    createSendToken(user, 200, res);

  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// 3. LOGOUT (Nuevo: Para borrar la cookie)
export const logout = (req, res) => {
  res.cookie("token", "logout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

// ... El resto de tus funciones (getSupportAgents, createStaff, etc.) déjalas igual ...
// 4. OBTENER AGENTES
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
  
// 5. CREAR STAFF
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
          passwordHash: hashedPassword,
          role,
          department
        });
    
        res.status(201).json({ msg: "Personal creado correctamente" });
      } catch (error) {
        res.status(500).json({ msg: "Error creando personal" });
      }
};
  
// 6. ACTUALIZAR CONTRASEÑA
export const updatePassword = async (req, res) => {
      try {
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
          return res.status(400).json({ msg: "Mínimo 6 caracteres" });
        }
    
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
        
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        res.json({ msg: "Contraseña actualizada correctamente" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error actualizando contraseña" });
      }
};