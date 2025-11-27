import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    employeeId: { type: String, unique: true, required: true }, // Ej: DOC001
    emailInst: { type: String },
    phone: { type: String }, // Added phone field
    specialty: [{ type: String }] // ["Matemáticas", "Física"]
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", TeacherSchema);
