import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["SOPORTE GENERAL", "REDES", "HARDWARE", "SOFTWARE"],
      default: "SOPORTE GENERAL",
    },
    priority: {
      type: String,
      enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
      default: "BAJA",
    },
    status: {
      type: String,
      enum: ["ABIERTO", "EN_PROCESO", "ESPERANDO_CLIENTE", "RESUELTO", "CERRADO"],
      default: "ABIERTO",
    },
    // 👇 ¡ESTO ES LO QUE FALTABA!
    attachment: { 
      type: String, 
      default: null 
    },
    // ---------------------------
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    // Campos para Calificación
    rating: {
      type: Number,
      default: 0
    },
    feedback: {
        type: String,
        default: ""
    }
  },
  {
    timestamps: true, // Crea createdAt y updatedAt automáticamente
  }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);