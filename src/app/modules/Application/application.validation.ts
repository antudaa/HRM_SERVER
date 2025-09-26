import { z } from "zod";

/* Reusable */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const dateCoerced = z.coerce.date();

/* Approvers (optional at create; we can derive) */
const ApproverStage = z.object({
  approverId: objectId,
  commentsRequired: z.boolean().optional(),
  dueAt: dateCoerced.optional(),
});

/* Details per type */
const LeaveDetails = z.object({
  // ⬇️ default prevents “leaveMode is required” 400
  leaveMode: z.enum(["single", "multiple", "halfday"]).default("single"),
  leaveTypeId: objectId,
  halfDaySession: z.enum(["morning", "afternoon"]).optional(),
  adjustmentReason: z.string().optional(),
  adjustedDate: dateCoerced.optional(),
  expectedDeliveryDate: dateCoerced.optional(),
  childBirthDate: dateCoerced.optional(),
  effectiveDates: z.array(dateCoerced).optional(),
});

const AdjustmentDetails = z.object({
  mode: z.enum(["earn", "spend"]),
  days: z.number().positive(),
  forDate: dateCoerced.optional(),
  reason: z.string().optional(),
});

const BusinessTripDetails = z.object({
  purpose: z.string().min(1),
  destinations: z.array(z.object({ city: z.string().min(1), country: z.string().optional() })).min(1),
  itinerary: z.array(z.object({ date: dateCoerced, note: z.string().optional() })).optional(),
  needAdvance: z.boolean().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  costBreakdown: z.array(z.object({ label: z.string(), amount: z.number().nonnegative() })).optional(),
});

const BusinessTripReportDetails = z.object({
  tripRefId: objectId.optional(),
  summary: z.string().min(1),
  actualCost: z.number().nonnegative().optional(),
  receipts: z.array(z.string()).optional(),
  breakdown: z.array(z.object({ label: z.string(), amount: z.number().nonnegative() })).optional(),
});

const RefundDetails = z.object({
  items: z.array(z.object({ label: z.string().min(1), amount: z.number().nonnegative() })).min(1),
  total: z.number().nonnegative(),
  reason: z.string().optional(),
  receipts: z.array(z.string()).optional(),
});

const HomeOfficeDetails = z.object({
  dates: z.array(dateCoerced).min(1),
  reason: z.string().optional(),
});

const ResignationDetails = z.object({
  noticeDays: z.number().nonnegative().optional(),
  lastWorkingDay: dateCoerced,
  reason: z.string().optional(),
});

const DataUpdateDetails = z.object({
  fields: z
    .array(
      z.object({
        path: z.string().min(1),
        oldValue: z.any().optional(),
        newValue: z.any(),
        reason: z.string().optional(),
      })
    )
    .min(1),
});

/** IMPORTANT: keep this a plain ZodObject (no .refine/.superRefine) */
const BaseCore = z.object({
  orgId: objectId.optional(),
  applicantId: objectId,
  title: z.string().optional(),
  numberOfDays: z.number().nonnegative(),
  fromDate: dateCoerced,
  toDate: dateCoerced,
  reason: z.string().min(1),

  // template-driven creation support (validated in service)
  body: z.string().min(1).optional(),
  templateId: objectId.optional(),
  templateVars: z.record(z.any()).optional(),

  attachments: z.array(z.string()).optional(),
  ccWatchers: z.array(objectId).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  approvers: z.array(ApproverStage).optional(),
});

/* Discriminated union by applicationType */
export const CreateApplicationSchema = z.discriminatedUnion("applicationType", [
  BaseCore.extend({ applicationType: z.literal("leave"), leaveDetails: LeaveDetails }),
  BaseCore.extend({ applicationType: z.literal("adjustment"), adjustmentDetails: AdjustmentDetails }),
  BaseCore.extend({ applicationType: z.literal("business_trip"), businessTripDetails: BusinessTripDetails }),
  BaseCore.extend({ applicationType: z.literal("business_trip_report"), businessTripReportDetails: BusinessTripReportDetails }),
  BaseCore.extend({ applicationType: z.literal("refund"), refundDetails: RefundDetails }),
  BaseCore.extend({ applicationType: z.literal("home_office"), homeOfficeDetails: HomeOfficeDetails }),
  BaseCore.extend({ applicationType: z.literal("resignation"), resignationDetails: ResignationDetails }),
  BaseCore.extend({ applicationType: z.literal("data_update"), dataUpdateDetails: DataUpdateDetails }),
]);

export const AddCommentSchema = z.object({
  stageIndex: z.number().int().nonnegative(),
  senderId: objectId,
  role: z.enum(["applicant", "approver"]),
  message: z.string().min(1),
  attachments: z.array(z.string()).optional(),
  replyTo: objectId.optional(),
});

export const AdvanceStageSchema = z.object({
  approverId: objectId,
  action: z.enum(["approve", "reject", "comment"]),
  message: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const CancelSchema = z.object({
  cancelledBy: objectId,
  reason: z.string().optional(),
});
