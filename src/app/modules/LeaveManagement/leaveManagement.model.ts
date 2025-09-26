// import { model, Schema, Types } from "mongoose";
// import {
//   LeaveTypeModel,
//   TLeaveType,
// } from "./leaveManagement.interface";

// /* ------------------------------------------------------------------ */
// /* Sub-schemas (used directly; no Schema.Types.Mixed for these)       */
// /* ------------------------------------------------------------------ */

// const AccrualSchema = new Schema(
//   {
//     cadence: { type: String, enum: ["monthly", "quarterly", "yearly"], required: true },
//     daysPerPeriod: { type: Number, required: true, min: 0 },
//     prorateOnJoin: { type: Boolean, default: false },
//     prorateOnExit: { type: Boolean, default: false },
//     postOnDay: { type: Number, min: 1, max: 31 },
//   },
//   { _id: false }
// );

// const CarryForwardSchema = new Schema(
//   {
//     enabled: { type: Boolean, default: false },
//     maxDays: { type: Number, min: 0 },
//     expiryMonths: { type: Number, min: 0 },
//   },
//   { _id: false }
// );

// const EncashmentSchema = new Schema(
//   {
//     enabled: { type: Boolean, default: false },
//     maxDaysPerYear: { type: Number, min: 0 },
//   },
//   { _id: false }
// );

// const BalanceRulesSchema = new Schema(
//   {
//     initialCredits: { type: Number, required: true, min: 0 },
//     grantUpfrontAtReset: { type: Boolean, default: true },
//     maxBalanceCap: { type: Number, min: 0 },
//     allowNegativeBalance: { type: Boolean, default: false },
//     accrual: { type: AccrualSchema },
//     carryForward: { type: CarryForwardSchema },
//     encashment: { type: EncashmentSchema },
//   },
//   { _id: false }
// );

// const EligibilitySchema = new Schema(
//   {
//     gender: { type: String, enum: ["male", "female", "all"], default: "all" },
//     minTenureDays: { type: Number, min: 0 },
//     probationAllowed: { type: Boolean, default: true },
//     jobTypes: [{ type: String }],
//     workModes: [{ type: String }],
//     departmentIds: [{ type: Schema.Types.ObjectId, ref: "Department" }],
//     designationIds: [{ type: Schema.Types.ObjectId, ref: "Designation" }],
//     locationIds: [{ type: Schema.Types.ObjectId, ref: "Location" }],
//   },
//   { _id: false }
// );

// const BookingRulesSchema = new Schema(
//   {
//     minNoticeDays: { type: Number, min: 0 },
//     maxAdvanceBookingDays: { type: Number, min: 0 },
//     sameDayAllowed: { type: Boolean, default: true },
//     allowPastDaysWithin: { type: Number, min: 0 },
//     approvalLevelsRequired: { type: Number, min: 0, default: 1 },
//     autoApproveAfterDays: { type: Number, min: 0 },
//   },
//   { _id: false }
// );

// const DurationRulesSchema = new Schema(
//   {
//     unit: { type: String, enum: ["day", "hour"], required: true },
//     minIncrement: { type: Number, required: true, min: 0.125 },
//     allowedIncrements: [{ type: Number, min: 0 }],
//     maxConsecutiveDays: { type: Number, min: 0 },
//     includeWeekends: { type: Boolean, default: false },
//     includeHolidays: { type: Boolean, default: false },
//     sandwichRule: { type: String, enum: ["count", "ignore", "company_policy"], default: "company_policy" },
//   },
//   { _id: false }
// );

// const DocumentationRulesSchema = new Schema(
//   {
//     requiresDocs: { type: Boolean, default: false },
//     medicalDocAfterDays: { type: Number, min: 0 },
//     allowedDocTypes: [{ type: String }],
//     attachmentMaxSizeMB: { type: Number, min: 1 },
//   },
//   { _id: false }
// );

// const ValiditySchema = new Schema(
//   {
//     effectiveFrom: { type: Date },
//     effectiveTo: { type: Date },
//     blackoutDateRanges: [
//       {
//         start: { type: Date, required: true },
//         end: { type: Date, required: true },
//         _id: false,
//       },
//     ],
//   },
//   { _id: false }
// );

// /* ------------------------------------------------------------------ */
// /* Main schema                                                        */
// /* ------------------------------------------------------------------ */

// const LeaveTypeSchema = new Schema<TLeaveType, LeaveTypeModel>(
//   {
//     name: { type: String, required: true },
//     code: { type: String, required: true, uppercase: true, index: true, unique: true },
//     description: { type: String },

//     isPaid: { type: Boolean, required: true },
//     active: { type: Boolean, default: true, required: true },
//     resetPolicy: {
//       type: String,
//       enum: ["calendar_year", "join_date_anniversary", "none"],
//       required: true,
//     },

//     // use the sub-schemas (no Mixed)
//     eligibility: { type: EligibilitySchema },
//     bookingRules: { type: BookingRulesSchema },
//     durationRules: { type: DurationRulesSchema, required: true },
//     documentation: { type: DocumentationRulesSchema },
//     validity: { type: ValiditySchema },
//     balanceRules: { type: BalanceRulesSchema, required: true },

//     usesAdjustmentBank: { type: Boolean },
//     adjustmentExpiryDays: { type: Number },

//     createdBy: { type: Schema.Types.ObjectId, ref: "User" },
//     updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
//     isDeleted: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// /* ------------------------------------------------------------------ */
// /* Indexes                                                            */
// /* ------------------------------------------------------------------ */
// LeaveTypeSchema.index({ active: 1, isDeleted: 1 }, { name: "idx_leaveType_active_deleted" });

// /* ------------------------------------------------------------------ */
// /* Statics                                                            */
// /* ------------------------------------------------------------------ */

// LeaveTypeSchema.statics.isCodeTaken = async function (code: string): Promise<boolean> {
//   const existing = await this.findOne({ code: code.toUpperCase(), isDeleted: false });
//   return !!existing;
// };

// LeaveTypeSchema.statics.findByCode = function (code: string) {
//   return this.findOne({ code: code.toUpperCase(), isDeleted: false });
// };

// LeaveTypeSchema.statics.listActive = function () {
//   return this.find({ active: true, isDeleted: false }).sort({ name: 1 });
// };

// LeaveTypeSchema.statics.getApplicableForEmployee = async function (
//   _employeeId: Types.ObjectId
// ) {
//   // Extend with real employee-policy matching later
//   return this.find({ active: true, isDeleted: false });
// };

// LeaveTypeSchema.statics.computeEntitlementForEmployee = async function (
//   leaveTypeId: Types.ObjectId,
//   _employeeId: Types.ObjectId,
//   _asOf: Date = new Date()
// ) {
//   const lt = await this.findById(leaveTypeId);
//   if (!lt || lt.isDeleted || !lt.active) {
//     return {
//       openingBalance: 0,
//       accrued: 0,
//       carryForwarded: 0,
//       encashed: 0,
//       consumed: 0,
//       remaining: 0,
//       capApplied: false,
//     };
//   }

//   // Placeholder — wire up to ledger later
//   const openingBalance = lt.balanceRules.initialCredits || 0;
//   const accrued = 0;
//   const carryForwarded = 0;
//   const encashed = 0;
//   const consumed = 0;

//   let remaining = openingBalance + accrued + carryForwarded - encashed - consumed;
//   let capApplied = false;
//   const cap = lt.balanceRules.maxBalanceCap;
//   if (cap != null && remaining > cap) {
//     remaining = cap;
//     capApplied = true;
//   }

//   return { openingBalance, accrued, carryForwarded, encashed, consumed, remaining, capApplied };
// };

// LeaveTypeSchema.statics.canApply = async function (
//   leaveTypeId: Types.ObjectId,
//   _employeeId: Types.ObjectId,
//   params: {
//     from: Date;
//     to: Date;
//     unitsRequested: number;
//     hasDocs?: boolean;
//     isProbation?: boolean;
//     tenureDays?: number;
//   }
// ) {
//   const lt: TLeaveType | null = await this.findById(leaveTypeId);
//   if (!lt || lt.isDeleted || !lt.active) {
//     return { ok: false, reason: "Leave type not available" };
//   }

//   const { bookingRules, documentation, eligibility, durationRules, validity } = lt;

//   // effective window
//   if (validity?.effectiveFrom && params.from < validity.effectiveFrom) {
//     return { ok: false, reason: "Leave not yet effective" };
//   }
//   if (validity?.effectiveTo && params.to > validity.effectiveTo) {
//     return { ok: false, reason: "Leave no longer valid" };
//   }

//   // notice
//   if (bookingRules?.minNoticeDays) {
//     const minStart = new Date();
//     minStart.setDate(minStart.getDate() + bookingRules.minNoticeDays);
//     if (params.from < minStart && bookingRules.sameDayAllowed !== true) {
//       return { ok: false, reason: "Insufficient notice period" };
//     }
//   }

//   // backdating
//   if (bookingRules?.allowPastDaysWithin != null) {
//     const earliestPast = new Date();
//     earliestPast.setDate(earliestPast.getDate() - bookingRules.allowPastDaysWithin);
//     if (params.from < earliestPast) {
//       return { ok: false, reason: "Backdated request not allowed that far" };
//     }
//   }

//   // increments
//   if (durationRules?.allowedIncrements?.length) {
//     if (!durationRules.allowedIncrements.includes(params.unitsRequested)) {
//       return { ok: false, reason: "Invalid increment requested" };
//     }
//   } else if (durationRules?.minIncrement && params.unitsRequested % durationRules.minIncrement !== 0) {
//     return { ok: false, reason: "Requested units not aligned to min increment" };
//   }

//   // documentation
//   if (documentation?.requiresDocs && !params.hasDocs) {
//     return { ok: false, reason: "Supporting documents required", requiresDocs: true };
//   }

//   // probation / tenure (light checks; enrich with real Employee data later)
//   if (eligibility?.probationAllowed === false && params.isProbation) {
//     return { ok: false, reason: "Not allowed during probation" };
//   }
//   if (eligibility?.minTenureDays && (params.tenureDays ?? 0) < eligibility.minTenureDays) {
//     return { ok: false, reason: "Minimum tenure not met" };
//   }

//   return {
//     ok: true,
//     approvalLevelsRequired: bookingRules?.approvalLevelsRequired ?? 1,
//     requiresDocs: !!documentation?.requiresDocs,
//   };
// };

// export const LeaveType = model<TLeaveType, LeaveTypeModel>("LeaveType", LeaveTypeSchema);
