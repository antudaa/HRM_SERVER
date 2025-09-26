// import { Schema, model, Types, ClientSession } from "mongoose";
// import { EmployeeLeaveBalanceModel, TEmployeeLeaveBalance } from "./employeeLeaveBalance.interface";
// import { LeaveLedger } from "./leaveLedger.model";
// import { TLedgerType } from "./leaveLedger.interface";

// const schema = new Schema<TEmployeeLeaveBalance, EmployeeLeaveBalanceModel>(
//   {
//     employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
//     leaveTypeId: { type: Schema.Types.ObjectId, ref: "LeaveType", required: true, index: true },
//     year: { type: Number, required: true, index: true },

//     openingBalance: { type: Number, default: 0 },
//     accrued: { type: Number, default: 0 },
//     used: { type: Number, default: 0 },
//     pending: { type: Number, default: 0 },
//     carryForward: { type: Number, default: 0 },
//     encashed: { type: Number, default: 0 },

//     maxNegative: { type: Number },
//     locked: { type: Boolean },
//     lastAccrualRunAt: { type: Date },
//     lastRecalculatedAt: { type: Date },
//   },
//   { timestamps: true }
// );

// // ✅ ensure one row per employee+leaveType+year
// schema.index(
//   { employeeId: 1, leaveTypeId: 1, year: 1 },
//   { unique: true, name: "uniq_emp_leaveType_year" }
// );

// schema.statics.upsertForEmployeeYear = async function (
//   employeeId: Types.ObjectId,
//   leaveTypeId: Types.ObjectId,
//   year: number,
//   seed?: Partial<Pick<TEmployeeLeaveBalance, "openingBalance" | "carryForward">>
// ) {
//   const doc = await this.findOneAndUpdate(
//     { employeeId, leaveTypeId, year },
//     { $setOnInsert: { ...seed } },
//     { upsert: true, new: true }
//   );
//   return doc;
// };

// schema.statics.getForEmployeeYear = function (employeeId: Types.ObjectId, year: number) {
//   return this.find({ employeeId, year }).lean();
// };

// schema.statics.recomputeFromLedger = async function (
//   employeeId: Types.ObjectId,
//   leaveTypeId: Types.ObjectId,
//   year: number
// ) {
//   const ledgers = await LeaveLedger.find({ employeeId, leaveTypeId, year }).lean();

//   let openingBalance = 0,
//     accrued = 0,
//     used = 0,
//     pending = 0,
//     carryForward = 0,
//     encashed = 0;

//   for (const l of ledgers) {
//     switch (l.type) {
//       case "OPENING": openingBalance += l.days; break;
//       case "CARRY_FORWARD_IN": carryForward += l.days; break;
//       case "CARRY_FORWARD_OUT": carryForward -= l.days; break;
//       case "ACCRUAL": accrued += l.days; break;
//       case "PENDING_ADD": pending += l.days; break;
//       case "PENDING_REMOVE": pending -= l.days; break;
//       case "CONSUME": used += l.days; break;
//       case "ENCASH": encashed += l.days; break;
//       case "ADJUSTMENT": accrued += l.days; break;
//       case "REVERSE": accrued -= l.days; break;
//     }
//   }

//   const doc = await this.findOneAndUpdate(
//     { employeeId, leaveTypeId, year },
//     {
//       openingBalance,
//       accrued,
//       used,
//       pending,
//       carryForward,
//       encashed,
//       lastRecalculatedAt: new Date(),
//     },
//     { upsert: true, new: true }
//   );
//   return doc;
// };

// type LedgerInput = {
//   employeeId: Types.ObjectId;
//   leaveTypeId: Types.ObjectId;
//   year: number;
//   type: TLedgerType;
//   days: number;
//   applicationId?: Types.ObjectId;
//   note?: string;
//   createdBy?: Types.ObjectId;
// };

// schema.statics.postLedgerAndRecompute = async function (
//   ledger: LedgerInput,
//   session?: ClientSession
// ) {
//   await LeaveLedger.create([ledger], { session });
//   return this.recomputeFromLedger(ledger.employeeId, ledger.leaveTypeId, ledger.year);
// };

// export const EmployeeLeaveBalance = model<TEmployeeLeaveBalance, EmployeeLeaveBalanceModel>(
//   "EmployeeLeaveBalance",
//   schema
// );
