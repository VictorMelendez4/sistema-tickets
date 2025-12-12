import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Configuración para saber dónde estamos parados
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir la ruta de la carpeta 'uploads' (subiendo 2 niveles desde middlewares)
const uploadDir = path.join(__dirname, "../../uploads");

// Crear la carpeta si no existe (para evitar errores)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Guardar en la carpeta uploads
  },
  filename: function (req, file, cb) {
    // Nombre único: ticket-FECHA.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Límite de 20MB
});

export default upload;