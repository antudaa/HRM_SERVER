// models/workShift.model.ts
import { Schema, model } from "mongoose";
import { TWorkShift, WorkShiftModel } from "./workShift.interface";

const workShiftSchema = new Schema<TWorkShift>(
  {
    shiftName: { type: String, required: true, unique: true },
    shiftType: { type: String, enum: ["fullday", "halfday", "custom"], required: true },
    shiftStarts: { type: String, required: true }, // Format: HH:mm
    shiftEnds: { type: String, required: true },   // Format: HH:mm
    shiftDuration: { type: Number },               // Calculated: number of days
    shiftStartsDate: { type: Date, required: true },
    shiftEndsDate: { type: Date, required: true },
    workingHour: { type: Number },                 // Calculated: hours from time strings
    shiftYear: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// 📌 Static method
workShiftSchema.statics.isShiftAvailable = async function (shiftName: string) {
  return this.findOne({ shiftName, isDeleted: false });
};

// 📌 Pre-save hook to auto-calculate shiftDuration & workingHour
workShiftSchema.pre("save", function (next) {
  // --- Calculate shiftDuration (days between two dates) ---
  if (this.shiftStartsDate && this.shiftEndsDate) {
    const durationMs = this.shiftEndsDate.getTime() - this.shiftStartsDate.getTime();
    this.shiftDuration = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  }

  // --- Calculate workingHour (hours between two HH:mm strings) ---
  if (this.shiftStarts && this.shiftEnds) {
    const [startHour, startMin] = this.shiftStarts.split(":").map(Number);
    const [endHour, endMin] = this.shiftEnds.split(":").map(Number);

    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    let durationMin = end - start;
    if (durationMin < 0) durationMin += 24 * 60; // handles overnight shifts

    this.workingHour = +(durationMin / 60).toFixed(2); // store to 2 decimal precision
  }

  next();
});

export const WorkShift = model<TWorkShift, WorkShiftModel>("WorkShift", workShiftSchema);
