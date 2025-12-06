import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["HARDWARE", "SOFTWARE", "REDES", "OTROS"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
      default: "MEDIA",
    },
    status: {
      type: String,
      enum: ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"],
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
    solution: { type: String }, // Para cuando se resuelva
  },
  { timestamps: true }
);

export const Ticket = mongoose.model("Ticket", TicketSchema);