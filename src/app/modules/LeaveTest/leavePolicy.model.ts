// import { Schema, model } from "mongoose";
// import { LeavePolicyModel, TLeavePolicy } from "./leavePolicy.interface";

// const policySchema = new Schema<TLeavePolicy, LeavePolicyModel>(
//   {
//     orgId: { type: Schema.Types.ObjectId, ref: "Organization" },
//     leaveTypeId: { type: Schema.Types.ObjectId, ref: "LeaveType", required: true, index: true },
//     year: { type: Number, required: true, index: true },

//     accrual: {
//       enabled: { type: Boolean, default: false },
//       cadence: { type: String, enum: ["monthly", "quarterly", "yearly"], default: "yearly" },
//       daysPerPeriod: { type: Number, default: 0 },
//       prorateOnJoin: { type: Boolean, default: false },
//       runDay: { type: Number, default: 1 },
//     },
//     carryForward: {
//       enabled: { type: Boolean, default: false },
//       maxDays: Number,
//       expiresAfterMonths: Number,
//     },
//     encashment: {
//       enabled: { type: Boolean, default: false },
//       minBalanceToEncash: Number,
//       maxDaysPerYear: Number,
//     },
//     booking: {
//       minUnit: { type: Number, enum: [0.5, 1], default: 1 },
//       maxConsecutiveDays: Number,
//       requireDocsIfDaysGTE: Number,
//       excludeHolidays: { type: Boolean, default: false },
//       excludeWeekends: { type: Boolean, default: false },
//       allowNegativeBalance: { type: Boolean, default: false },
//     },
//     approval: {
//       tiers: [{ role: String, employeeId: { type: Schema.Types.ObjectId, ref: "Employee" } }],
//     },

//     active: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// policySchema.index({ orgId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

// policySchema.statics.getActiveFor = function (orgId, leaveTypeId, year) {
//   return this.findOne({ orgId: orgId ?? { $exists: false }, leaveTypeId, year, active: true });
// };

// export const LeavePolicy = model<TLeavePolicy, LeavePolicyModel>("LeavePolicy", policySchema);
