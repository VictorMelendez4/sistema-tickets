import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "SUPPORT", "CLIENT"],
      default: "CLIENT",
    },
    
    department: {
      type: String,
      enum: ["SOPORTE GENERAL", "REDES", "HARDWARE", "SOFTWARE", "ADMINISTRACION"],
      default: "SOPORTE GENERAL"
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);