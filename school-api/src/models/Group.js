import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String }, // opcional, ej: "1A", "Grupo A"
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    term: { type: String, required: true }, // Ej: "2025-1"
    schedule: [
      {
        day: { type: Number },     // 1=Lunes, 2=Martes...
        start: { type: String },   // "09:00"
        end:   { type: String },   // "10:00"
        room:  { type: String }    // "A1"
      }
    ]
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", GroupSchema);
