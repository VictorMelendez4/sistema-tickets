import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // 1. PRIMERO: Buscamos el token en las COOKIES (La nueva forma segura)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. SEGUNDO: Buscamos en el Header (Por si acaso usas Postman o móvil)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Si no se encontró en ninguno de los dos lados:
  if (!token) {
    return res.status(401).json({ msg: "No autorizado, no se encontró token" });
  }

  try {
    // Verificar que el token sea válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario dueño del token
    req.user = await User.findById(decoded.id).select("-passwordHash");
    
    if (!req.user) {
        return res.status(401).json({ msg: "El usuario de este token ya no existe" });
    }

    next(); // Pasa adelante
  } catch (error) {
    console.error("Error en auth middleware:", error);
    res.status(401).json({ msg: "Token no válido o expirado" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "No tienes permisos para esta acción" });
    }
    next();
  };
};