import { Schema, model } from "mongoose";
import { LeaveLedgerModel, TLeaveLedger } from "./leaveLedger.interface";

const LeaveLedgerSchema = new Schema<TLeaveLedger, LeaveLedgerModel>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: "LeaveType", required: true },
    year: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        "OPENING",
        "CARRY_FORWARD_IN",
        "CARRY_FORWARD_OUT",
        "ACCRUAL",
        "PENDING_ADD",
        "PENDING_REMOVE",
        "CONSUME",
        "ADJUSTMENT",
        "ENCASH",
        "REVERSE",
      ],
      required: true,
    },
    days: { type: Number, required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LeaveLedgerSchema.index({ employeeId: 1, year: 1 });
LeaveLedgerSchema.index({ leaveTypeId: 1, year: 1 });
LeaveLedgerSchema.index({ employeeId: 1, leaveTypeId: 1, year: 1 });

LeaveLedgerSchema.statics.getForEmployeeYear = function (employeeId, year) {
  return this.find({ employeeId, year }).lean();
};

export const LeaveLedger = model<TLeaveLedger, LeaveLedgerModel>("LeaveLedger", LeaveLedgerSchema);
