import { Schema, model } from "mongoose";
import { HolidayModel, THoliday } from "./holiday.interface";

const HolidaySchema = new Schema<THoliday, HolidayModel>(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    description: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

HolidaySchema.index({ startDate: 1, endDate: 1 });
HolidaySchema.index({ name: 1, startDate: 1 }, { unique: false });

HolidaySchema.statics.getByRange = function (start: string, end: string) {
  return this.find({
    isDeleted: false,
    startDate: { $lte: end },
    $or: [{ endDate: { $gte: start } }, { endDate: { $exists: false } }],
  }).sort({ startDate: 1, name: 1 });
};

HolidaySchema.statics.getActive = function () {
  return this.find({ isDeleted: false }).sort({ startDate: 1, name: 1 });
};

export const Holiday = model<THoliday, HolidayModel>("Holiday", HolidaySchema);
