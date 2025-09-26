// import { Model, Types } from "mongoose";
// import { TLedgerType } from "./leaveLedger.interface"; // ✅ bring in the union

// export type TEmployeeLeaveBalance = {
//   employeeId: Types.ObjectId;
//   leaveTypeId: Types.ObjectId;
//   year: number;

//   openingBalance: number;
//   accrued: number;
//   used: number;
//   pending: number;
//   carryForward: number;
//   encashed: number;

//   maxNegative?: number;
//   locked?: boolean;
//   lastAccrualRunAt?: Date;
//   lastRecalculatedAt?: Date;

//   createdAt?: Date;
//   updatedAt?: Date;
// };

// export interface EmployeeLeaveBalanceModel extends Model<TEmployeeLeaveBalance> {
//   upsertForEmployeeYear(
//     employeeId: Types.ObjectId,
//     leaveTypeId: Types.ObjectId,
//     year: number,
//     seed?: Partial<Pick<TEmployeeLeaveBalance, "openingBalance" | "carryForward">>
//   ): Promise<TEmployeeLeaveBalance>;

//   recomputeFromLedger(
//     employeeId: Types.ObjectId,
//     leaveTypeId: Types.ObjectId,
//     year: number
//   ): Promise<TEmployeeLeaveBalance>;

//   // ✅ use TLedgerType instead of string
//   postLedgerAndRecompute(
//     ledger: {
//       employeeId: Types.ObjectId;
//       leaveTypeId: Types.ObjectId;
//       year: number;
//       type: TLedgerType;
//       days: number;
//       applicationId?: Types.ObjectId;
//       note?: string;
//       createdBy?: Types.ObjectId;
//     },
//     session?: any
//   ): Promise<TEmployeeLeaveBalance>;

//   getForEmployeeYear(
//     employeeId: Types.ObjectId,
//     year: number
//   ): Promise<TEmployeeLeaveBalance[]>;
// }
