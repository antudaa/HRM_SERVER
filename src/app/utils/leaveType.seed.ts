import { Types } from "mongoose";
import { TLeaveType } from "../modules/LeaveManagement/leaveManagement.interface";
import { LeaveType } from "../modules/LeaveManagement/leaveManagement.model";

const seed: Array<Partial<TLeaveType>> = [
  {
    name: "Casual Leave",
    code: "CL",
    isPaid: true,
    active: true,
    resetPolicy: "calendar_year",
    durationRules: {
      unit: "day",
      minIncrement: 0.5,
      allowedIncrements: [0.5, 1],
      includeHolidays: false,
      includeWeekends: false,
      sandwichRule: "company_policy",
    },
    bookingRules: {
      minNoticeDays: 0,
      allowPastDaysWithin: 7,
      approvalLevelsRequired: 1,
    },
    documentation: { requiresDocs: false },
    balanceRules: {
      initialCredits: 8,
      grantUpfrontAtReset: true,
      allowNegativeBalance: false,
      carryForward: { enabled: false },
    },
  },
  {
    name: "Sick Leave",
    code: "SL",
    isPaid: true,
    active: true,
    resetPolicy: "calendar_year",
    durationRules: {
      unit: "day",
      minIncrement: 0.5,
      allowedIncrements: [0.5, 1],
      includeHolidays: false,
      includeWeekends: false,
      sandwichRule: "ignore",
    },
    bookingRules: {
      minNoticeDays: 0,
      allowPastDaysWithin: 30,
      approvalLevelsRequired: 1,
    },
    documentation: { requiresDocs: true, medicalDocAfterDays: 2 },
    balanceRules: {
      initialCredits: 10,
      grantUpfrontAtReset: true,
      allowNegativeBalance: false,
      carryForward: { enabled: true, maxDays: 5, expiryMonths: 12 },
    },
  },
  {
    name: "Annual Leave",
    code: "AL",
    isPaid: true,
    active: true,
    resetPolicy: "calendar_year",
    durationRules: {
      unit: "day",
      minIncrement: 1,
      includeHolidays: false,
      includeWeekends: false,
      sandwichRule: "company_policy",
    },
    bookingRules: {
      minNoticeDays: 3,
      maxAdvanceBookingDays: 180,
      approvalLevelsRequired: 1,
    },
    documentation: { requiresDocs: false },
    balanceRules: {
      initialCredits: 0,
      grantUpfrontAtReset: false,
      allowNegativeBalance: false,
      accrual: { cadence: "monthly", daysPerPeriod: 1, prorateOnJoin: true, prorateOnExit: true },
      carryForward: { enabled: true, maxDays: 10, expiryMonths: 12 },
      maxBalanceCap: 36,
    },
  },
  {
    name: "Unpaid Leave",
    code: "UPL",
    isPaid: false,
    active: true,
    resetPolicy: "none",
    durationRules: {
      unit: "day",
      minIncrement: 0.5,
      allowedIncrements: [0.5, 1],
      includeHolidays: false,
      includeWeekends: false,
      sandwichRule: "ignore",
    },
    documentation: { requiresDocs: false },
    balanceRules: {
      initialCredits: 0,
      grantUpfrontAtReset: false,
      allowNegativeBalance: true,
      carryForward: { enabled: false },
    },
  },
  {
    name: "Maternity Leave",
    code: "MAT",
    isPaid: true,
    active: true,
    resetPolicy: "none",
    eligibility: { gender: "female", probationAllowed: false },
    durationRules: {
      unit: "day",
      minIncrement: 1,
      includeHolidays: false,
      includeWeekends: false,
      sandwichRule: "ignore",
    },
    bookingRules: { minNoticeDays: 30, approvalLevelsRequired: 1 },
    documentation: { requiresDocs: true },
    balanceRules: {
      initialCredits: 0,
      grantUpfrontAtReset: false,
      allowNegativeBalance: false,
      carryForward: { enabled: false },
    },
  },
  {
    name: "Paternity Leave",
    code: "PAT",
    isPaid: true,
    active: true,
    resetPolicy: "none",
    eligibility: { gender: "male", probationAllowed: false },
    durationRules: {
      unit: "day",
      minIncrement: 1,
      includeHolidays: false,
      includeWeekends: false,
      sandwichRule: "ignore",
    },
    bookingRules: { minNoticeDays: 15, approvalLevelsRequired: 1 },
    documentation: { requiresDocs: true },
    balanceRules: {
      initialCredits: 0,
      grantUpfrontAtReset: false,
      allowNegativeBalance: false,
      carryForward: { enabled: false },
    },
  },
  {
    name: "Compensatory Off",
    code: "COMP_OFF",
    isPaid: true,
    active: true,
    resetPolicy: "none",
    usesAdjustmentBank: true,
    adjustmentExpiryDays: 180,
    durationRules: {
      unit: "day",
      minIncrement: 0.5,
      allowedIncrements: [0.5, 1],
      includeHolidays: false,
      includeWeekends: false,
      sandwichRule: "ignore",
    },
    bookingRules: {
      minNoticeDays: 0,
      allowPastDaysWithin: 30,
      approvalLevelsRequired: 1,
    },
    documentation: { requiresDocs: false },
    balanceRules: {
      initialCredits: 0,
      grantUpfrontAtReset: false,
      allowNegativeBalance: false,
      carryForward: { enabled: true, expiryMonths: 6 },
    },
  },
];

export async function upsertDefaultLeaveTypes(adminId?: string) {
  for (const item of seed) {
    const found = await LeaveType.findOne({ code: item.code }).select("_id").lean();
    if (found) {
      await LeaveType.findByIdAndUpdate(
        found._id,
        { ...item, updatedBy: adminId ? new Types.ObjectId(adminId) : undefined },
        { new: true }
      );
    } else {
      await LeaveType.create({ ...item, createdBy: adminId ? new Types.ObjectId(adminId) : undefined });
    }
  }
}
