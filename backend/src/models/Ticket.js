import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    // Departamento
    department: {
      type: String,
      enum: ["HARDWARE", "SOFTWARE", "REDES", "SOPORTE GENERAL"], 
      required: true,
    },
    
    priority: {
      type: String,
      enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
      default: "MEDIA",
    },
    status: {
      type: String,
      enum: ["ABIERTO", "EN_PROCESO", "ESPERANDO_CLIENTE", "RESUELTO", "CERRADO"],
      default: "ABIERTO",
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null
    },
    solution: { type: String }, 
    
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment" 
    }],

    rating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 // 0 significa "No calificado"
    },
    feedback: { 
      type: String, 
      default: "" // Comentario opcional del cliente
    }
  },
  { timestamps: true }
);

export const Ticket = mongoose.model("Ticket", TicketSchema);