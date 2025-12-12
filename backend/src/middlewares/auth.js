import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // 1. Buscamos el token en la COOKIE (Prioridad)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. O en el Header (Respaldo)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "No autorizado, inicie sesión" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token inválido" });
  }
};