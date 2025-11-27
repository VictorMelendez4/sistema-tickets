import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    curpOrId: { type: String, unique: true, sparse: true },
    emailAcad: String,
    phone: String,
    status: {
      type: String,
      enum: ["REGULAR", "IRREGULAR", "BAJA"],
      default: "REGULAR"
    }
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", StudentSchema);
