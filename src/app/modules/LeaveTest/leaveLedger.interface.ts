// import { Model, Types } from "mongoose";

// export type TLedgerType =
//   | "OPENING"
//   | "CARRY_FORWARD_IN"
//   | "CARRY_FORWARD_OUT"
//   | "ACCRUAL"
//   | "PENDING_ADD"
//   | "PENDING_REMOVE"
//   | "CONSUME"
//   | "ADJUSTMENT"
//   | "ENCASH"
//   | "REVERSE";

// export type TLeaveLedger = {
//   employeeId: Types.ObjectId;
//   leaveTypeId: Types.ObjectId;
//   year: number;
//   type: TLedgerType;
//   days: number;
//   applicationId?: Types.ObjectId;
//   note?: string;
//   createdBy?: Types.ObjectId;
//   createdAt?: Date;
// };

// export interface LeaveLedgerModel extends Model<TLeaveLedger> {
//   getForEmployeeYear(employeeId: Types.ObjectId, year: number): Promise<TLeaveLedger[]>;
// }
