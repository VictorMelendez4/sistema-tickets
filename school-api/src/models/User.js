// src/models/User.js (BACKEND)

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "TEACHER"],
      default: "ADMIN",
    },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    active: {
      type: Boolean,
      default: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
