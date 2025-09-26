import { z } from "zod";

/** Shared sub-schemas */
const Accrual = z.object({
  cadence: z.enum(["monthly", "quarterly", "yearly"]),
  daysPerPeriod: z.number().min(0),
  prorateOnJoin: z.boolean().optional(),
  prorateOnExit: z.boolean().optional(),
  postOnDay: z.number().int().min(1).max(31).optional(),
});

const CarryForward = z.object({
  enabled: z.boolean().default(false),
  maxDays: z.number().min(0).optional(),
  expiryMonths: z.number().min(0).optional(),
});

const Encashment = z.object({
  enabled: z.boolean().default(false),
  maxDaysPerYear: z.number().min(0).optional(),
});

const BalanceRules = z.object({
  initialCredits: z.number().min(0),
  grantUpfrontAtReset: z.boolean().optional(),
  maxBalanceCap: z.number().min(0).optional(),
  allowNegativeBalance: z.boolean().optional(),
  accrual: Accrual.optional(),
  carryForward: CarryForward.optional(),
  encashment: Encashment.optional(),
});

const Eligibility = z.object({
  gender: z.enum(["male", "female", "all"]).optional(),
  minTenureDays: z.number().min(0).optional(),
  probationAllowed: z.boolean().optional(),
  jobTypes: z.array(z.string()).optional(),
  workModes: z.array(z.string()).optional(),
  departmentIds: z.array(z.string()).optional(),
  designationIds: z.array(z.string()).optional(),
  locationIds: z.array(z.string()).optional(),
});

const BookingRules = z.object({
  minNoticeDays: z.number().min(0).optional(),
  maxAdvanceBookingDays: z.number().min(0).optional(),
  sameDayAllowed: z.boolean().optional(),
  allowPastDaysWithin: z.number().min(0).optional(),
  approvalLevelsRequired: z.number().min(0).optional(),
  autoApproveAfterDays: z.number().min(0).optional(),
});

const DurationRules = z.object({
  unit: z.enum(["day", "hour"]),
  minIncrement: z.number().positive(),
  allowedIncrements: z.array(z.number().positive()).optional(),
  maxConsecutiveDays: z.number().min(0).optional(),
  includeWeekends: z.boolean().optional(),
  includeHolidays: z.boolean().optional(),
  sandwichRule: z.enum(["count", "ignore", "company_policy"]).optional(),
});

const Documentation = z.object({
  requiresDocs: z.boolean().optional(),
  medicalDocAfterDays: z.number().min(0).optional(),
  allowedDocTypes: z.array(z.string()).optional(),
  attachmentMaxSizeMB: z.number().min(1).optional(),
});

const Validity = z.object({
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  blackoutDateRanges: z.array(z.object({ start: z.coerce.date(), end: z.coerce.date() })).optional(),
});

/** Create & Update DTOs */
export const CreateLeaveTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  isPaid: z.boolean(),
  active: z.boolean().default(true),
  resetPolicy: z.enum(["calendar_year", "join_date_anniversary", "none"]),
  eligibility: Eligibility.optional(),
  bookingRules: BookingRules.optional(),
  durationRules: DurationRules,
  documentation: Documentation.optional(),
  validity: Validity.optional(),
  balanceRules: BalanceRules,
  usesAdjustmentBank: z.boolean().optional(),
  adjustmentExpiryDays: z.number().int().min(0).optional(),
});

export const UpdateLeaveTypeSchema = CreateLeaveTypeSchema.partial();
