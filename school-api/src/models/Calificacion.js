import mongoose from "mongoose";

const RubroSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },       // Ej: "Parcial 1"
    porcentaje: { type: Number, required: true },   // Ej: 30 (significa 30%)
    calificacion: { type: Number, required: true }  // Ej: 85
  },
  { _id: false }
);

const CalificacionSchema = new mongoose.Schema(
  {
    inscripcion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inscripcion",
      required: true
    },
    rubros: [RubroSchema],
    calificacionFinal: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

// Evitar dos registros de calificación para la misma inscripción
CalificacionSchema.index({ inscripcion: 1 }, { unique: true });

export const Calificacion = mongoose.model("Calificacion", CalificacionSchema);
