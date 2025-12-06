import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/User.js"; 

// Tu conexión a la nube (sacada de tus capturas)
const MONGO_URI = "mongodb+srv://admin22:checo123@sistematickets.pmz2qut.mongodb.net/test?retryWrites=true&w=majority";

async function crearAdmin() {
  try {
    console.log("Conectando a la nube...");
    await mongoose.connect(MONGO_URI);
    console.log("¡Conectado!");

    // 1. Crear el Hash de la contraseña "123456"
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("123456", salt);

    // 2. Crear el Usuario Admin
    const admin = await User.create({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@test.com",  // <--- ESTE SERÁ TU LOGIN
      passwordHash: hash,
      role: "ADMIN"             // <--- ROL DE JEFE
    });

    console.log("✅ ¡Admin creado con éxito!");
    console.log(admin);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

crearAdmin();