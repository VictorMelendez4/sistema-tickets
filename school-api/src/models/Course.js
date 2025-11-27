import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // Ej: MAT101
    name: { type: String, required: true },               // Ej: Matemáticas I
    credits: { type: Number, required: true },            // Ej: 8
    hoursWeek: { type: Number, required: true }           // Ej: 5
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", CourseSchema);
