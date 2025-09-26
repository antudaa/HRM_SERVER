import { Model, Types } from "mongoose";

/** --- Subtypes --- */
export type TLeaveAccrual = {
  cadence: "monthly" | "quarterly" | "yearly";
  daysPerPeriod: number;
  prorateOnJoin?: boolean;
  prorateOnExit?: boolean;
  postOnDay?: number;
};

export type TCarryForward = {
  enabled: boolean;
  maxDays?: number;
  expiryMonths?: number;
};

export type TEncashment = {
  enabled: boolean;
  maxDaysPerYear?: number;
};

export type TEligibility = {
  gender?: "male" | "female" | "all";
  minTenureDays?: number;
  probationAllowed?: boolean;
  jobTypes?: string[];
  workModes?: string[];
  departmentIds?: Types.ObjectId[];
  designationIds?: Types.ObjectId[];
  locationIds?: Types.ObjectId[];
};

export type TBookingRules = {
  minNoticeDays?: number;
  maxAdvanceBookingDays?: number;
  sameDayAllowed?: boolean;
  allowPastDaysWithin?: number;
  approvalLevelsRequired?: number;
  autoApproveAfterDays?: number;
};

export type TDurationRules = {
  unit: "day" | "hour";
  minIncrement: number;
  allowedIncrements?: number[];
  maxConsecutiveDays?: number;
  includeWeekends?: boolean;
  includeHolidays?: boolean;
  sandwichRule?: "count" | "ignore" | "company_policy";
};

export type TDocumentationRules = {
  requiresDocs?: boolean;
  medicalDocAfterDays?: number;
  allowedDocTypes?: string[];
  attachmentMaxSizeMB?: number;
};

export type TValidity = {
  effectiveFrom?: Date;
  effectiveTo?: Date;
  blackoutDateRanges?: { start: Date; end: Date }[];
};

export type TBalanceRules = {
  initialCredits: number;
  grantUpfrontAtReset?: boolean;
  maxBalanceCap?: number;
  allowNegativeBalance?: boolean;
  accrual?: TLeaveAccrual;
  carryForward?: TCarryForward;
  encashment?: TEncashment;
};

/** --- Main LeaveType --- */
export type TLeaveType = {
  _id?: Types.ObjectId;

  name: string;
  code: string; // unique, uppercase like "CL"

  description?: string;
  isPaid: boolean;
  active: boolean;
  resetPolicy: "calendar_year" | "join_date_anniversary" | "none";

  eligibility?: TEligibility;
  bookingRules?: TBookingRules;
  durationRules: TDurationRules;
  documentation?: TDocumentationRules;
  validity?: TValidity;
  balanceRules: TBalanceRules;

  usesAdjustmentBank?: boolean;
  adjustmentExpiryDays?: number;

  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: boolean;
};

export interface LeaveTypeModel extends Model<TLeaveType> {
  isCodeTaken(code: string): Promise<boolean>;
  findByCode(code: string): Promise<TLeaveType | null>;
  listActive(): Promise<TLeaveType[]>;
  getApplicableForEmployee(employeeId: Types.ObjectId): Promise<TLeaveType[]>;
  computeEntitlementForEmployee(
    leaveTypeId: Types.ObjectId,
    employeeId: Types.ObjectId,
    asOf?: Date
  ): Promise<{
    openingBalance: number;
    accrued: number;
    carryForwarded: number;
    encashed: number;
    consumed: number;
    remaining: number;
    capApplied?: boolean;
  }>;
  canApply(
    leaveTypeId: Types.ObjectId,
    employeeId: Types.ObjectId,
    params: {
      from: Date;
      to: Date;
      unitsRequested: number; // days or hours
      hasDocs?: boolean;
      isProbation?: boolean;
      tenureDays?: number;
    }
  ): Promise<{
    ok: boolean;
    reason?: string;
    requiresDocs?: boolean;
    approvalLevelsRequired?: number;
  }>;
}
