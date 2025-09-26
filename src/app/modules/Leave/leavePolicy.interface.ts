import { Model, Types } from "mongoose";

export type TAccrualRule = {
  enabled: boolean;
  cadence: "monthly" | "quarterly" | "yearly";
  daysPerPeriod: number;
  prorateOnJoin?: boolean;
  runDay?: number;
};

export type TCarryForwardRule = {
  enabled: boolean;
  maxDays?: number;
  expiresAfterMonths?: number;
};

export type TEncashmentRule = {
  enabled: boolean;
  minBalanceToEncash?: number;
  maxDaysPerYear?: number;
};

export type TBookingConstraints = {
  minUnit: 0.5 | 1;
  maxConsecutiveDays?: number;
  requireDocsIfDaysGTE?: number;
  excludeHolidays?: boolean;
  excludeWeekends?: boolean;
  allowNegativeBalance?: boolean;
};

export type TApprovalDefaults = {
  tiers: { role?: string; employeeId?: Types.ObjectId }[];
};

export type TLeavePolicy = {
  orgId?: Types.ObjectId;
  leaveTypeId: Types.ObjectId;
  year: number;

  accrual: TAccrualRule;
  carryForward: TCarryForwardRule;
  encashment: TEncashmentRule;
  booking: TBookingConstraints;
  approval?: TApprovalDefaults;

  active: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface LeavePolicyModel extends Model<TLeavePolicy> {
  getActiveFor(orgId: Types.ObjectId | undefined, leaveTypeId: Types.ObjectId, year: number): Promise<TLeavePolicy | null>;
}
