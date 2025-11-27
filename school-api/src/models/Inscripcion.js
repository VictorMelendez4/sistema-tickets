import mongoose from "mongoose";

const InscripcionSchema = new mongoose.Schema(
  {
    alumno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // modelo ya existente
      required: true
    },
    grupo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // modelo ya existente
      required: true
    },
    estado: {
      type: String,
      enum: ["ACTIVA", "BAJA", "APROBADO", "REPROBADO"],
      default: "ACTIVA"
    }
  },
  { timestamps: true }
);

// Evita inscribir dos veces al mismo alumno en el mismo grupo
InscripcionSchema.index({ alumno: 1, grupo: 1 }, { unique: true });

export const Inscripcion = mongoose.model("Inscripcion", InscripcionSchema);
