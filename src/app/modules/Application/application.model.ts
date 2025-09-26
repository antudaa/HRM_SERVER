import { Schema, model, Types } from "mongoose";
import {
  TGeneralApplication,
  ApplicationModel,
  TCommentThread,
  TApprovalStage,
  TLeaveApplicationDetails,
  TApplicationStatusTimeline,
  ApplicationStatus,
  ApplicationPriority,
  TAdjustmentDetails,
  TBusinessTripDetails,
  TBusinessTripReportDetails,
  TRefundDetails,
  THomeOfficeDetails,
  TResignationDetails,
  TDataUpdateDetails,
} from "./application.interface";

/* ----------------------------- Comment thread ----------------------------- */
const CommentThreadSchema = new Schema<TCommentThread>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    role: { type: String, enum: ["applicant", "approver"], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    attachments: [{ type: String }],
    replyTo: { type: Schema.Types.ObjectId },
    resolved: { type: Boolean, default: false },
  },
  { _id: true }
);

/* ------------------------------- Approval stage ------------------------------- */
const ApprovalStageSchema = new Schema<TApprovalStage>(
  {
    approverId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "commented", "skipped"],
      default: "pending",
    },
    commentThread: { type: [CommentThreadSchema], default: [] },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    commentsRequired: { type: Boolean, default: false },
    delegatedTo: { type: Schema.Types.ObjectId, ref: "Employee" },
    escalatedTo: { type: Schema.Types.ObjectId, ref: "Employee" },
    dueAt: { type: Date },
  },
  { _id: false }
);

/* -------------------------------- Leave details ------------------------------- */
const LeaveApplicationDetailsSchema = new Schema<TLeaveApplicationDetails>(
  {
    leaveMode: { type: String, enum: ["single", "multiple", "halfday"], required: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: "LeaveType", required: true },
    halfDaySession: { type: String, enum: ["morning", "afternoon"] },
    adjustmentReason: { type: String },
    adjustedDate: { type: Date },
    expectedDeliveryDate: { type: Date },
    childBirthDate: { type: Date },
    effectiveDates: [{ type: Date }],
  },
  { _id: false }
);

/* ---------------------------- Status timeline entries ---------------------------- */
const ApplicationStatusTimelineSchema = new Schema<TApplicationStatusTimeline>(
  {
    status: {
      type: String,
      enum: ["created", "submitted", "forwarded", "commented", "approved", "rejected", "cancelled", "restored"],
      required: true,
    },
    changedBy: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    changedAt: { type: Date, default: Date.now },
    message: { type: String },
  },
  { _id: false }
);

/* ------------------------------ NEW per-type schemas ------------------------------ */
const AdjustmentDetailsSchema = new Schema<TAdjustmentDetails>(
  {
    mode: { type: String, enum: ["earn", "spend"], required: true },
    days: { type: Number, required: true, min: 0.5 },
    forDate: { type: Date },
    reason: { type: String },
  },
  { _id: false }
);

const BusinessTripDetailsSchema = new Schema<TBusinessTripDetails>(
  {
    purpose: { type: String, required: true },
    destinations: [{ city: { type: String, required: true }, country: { type: String } }],
    itinerary: [{ date: { type: Date, required: true }, note: { type: String } }],
    needAdvance: { type: Boolean },
    estimatedCost: { type: Number },
    costBreakdown: [{ label: String, amount: Number }],
  },
  { _id: false }
);

const BusinessTripReportDetailsSchema = new Schema<TBusinessTripReportDetails>(
  {
    tripRefId: { type: Schema.Types.ObjectId, ref: "Application" },
    summary: { type: String, required: true },
    actualCost: { type: Number },
    receipts: [{ type: String }],
    breakdown: [{ label: String, amount: Number }],
  },
  { _id: false }
);

const RefundDetailsSchema = new Schema<TRefundDetails>(
  {
    items: [{ label: { type: String, required: true }, amount: { type: Number, required: true } }],
    total: { type: Number, required: true },
    reason: { type: String },
    receipts: [{ type: String }],
  },
  { _id: false }
);

const HomeOfficeDetailsSchema = new Schema<THomeOfficeDetails>(
  {
    dates: [{ type: Date, required: true }],
    reason: { type: String },
  },
  { _id: false }
);

const ResignationDetailsSchema = new Schema<TResignationDetails>(
  {
    noticeDays: { type: Number },
    lastWorkingDay: { type: Date, required: true },
    reason: { type: String },
  },
  { _id: false }
);

const DataUpdateDetailsSchema = new Schema<TDataUpdateDetails>(
  {
    fields: [{ path: { type: String, required: true }, oldValue: {}, newValue: {}, reason: { type: String } }],
  },
  { _id: false }
);

/* --------------------------------- Main schema ---------------------------------- */
const ApplicationSchema = new Schema<TGeneralApplication, ApplicationModel>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization" },

    applicationType: {
      type: String,
      enum: ["leave", "adjustment", "business_trip", "business_trip_report", "refund", "resignation", "home_office", "data_update"],
      required: true,
    },

    applicantId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    applicantSnapshot: {
      employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
      name: { type: String },
      departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
      designationId: { type: Schema.Types.ObjectId, ref: "Designation" },
    },

    applicationNo: { type: String, index: true },
    title: { type: String },

    numberOfDays: { type: Number, required: true, min: 0 },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    body: { type: String, required: true },

    approvers: { type: [ApprovalStageSchema], required: true },
    currentApproverIndex: { type: Number, default: 0 },
    currentStatus: {
      type: String,
      enum: ["draft", "in_review", "pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal", index: true },
    slaDueAt: { type: Date },
    finalDecisionDate: { type: Date },

    ccWatchers: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
    visibility: { type: String, enum: ["private", "department", "org"], default: "private" },

    isCancelled: { type: Boolean, default: false },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "Employee" },
    cancelledAt: { type: Date },
    cancelReason: { type: String },

    history: [
      {
        status: {
          type: String,
          enum: ["created", "submitted", "forwarded", "commented", "approved", "rejected", "cancelled", "restored"],
          required: true,
        },
        actorId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
        timestamp: { type: Date, default: Date.now },
        message: { type: String },
      },
    ],
    applicationStatusTimeline: { type: [ApplicationStatusTimelineSchema], default: [] },

    attachments: [{ type: String }],
    relatedApplicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    remarks: { type: String },

    // Per-type detail objects
    leaveDetails: { type: LeaveApplicationDetailsSchema },
    adjustmentDetails: { type: AdjustmentDetailsSchema },
    businessTripDetails: { type: BusinessTripDetailsSchema },
    businessTripReportDetails: { type: BusinessTripReportDetailsSchema },
    refundDetails: { type: RefundDetailsSchema },
    homeOfficeDetails: { type: HomeOfficeDetailsSchema },
    resignationDetails: { type: ResignationDetailsSchema },
    dataUpdateDetails: { type: DataUpdateDetailsSchema },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ----------------------------- Guards by type ----------------------------- */
ApplicationSchema.pre("validate", function (next) {
  const t = this.applicationType as string;

  // helper that either calls next(err) and returns false, or returns true to continue
  const ensure = (cond: boolean, msg: string) => {
    if (!cond) {
      next(new Error(msg));
      return false;
    }
    return true;
  };

  if (t === "leave") {
    if (!ensure(!!this.leaveDetails, "leaveDetails is required when applicationType is 'leave'")) return;
  } else if (t === "adjustment") {
    if (!ensure(!!this.adjustmentDetails, "adjustmentDetails is required when applicationType is 'adjustment'")) return;
  } else if (t === "business_trip") {
    if (!ensure(!!this.businessTripDetails, "businessTripDetails is required")) return;
  } else if (t === "business_trip_report") {
    if (!ensure(!!this.businessTripReportDetails, "businessTripReportDetails is required")) return;
  } else if (t === "refund") {
    if (!ensure(!!this.refundDetails, "refundDetails is required")) return;
  } else if (t === "home_office") {
    if (!ensure(!!this.homeOfficeDetails, "homeOfficeDetails is required")) return;
  } else if (t === "resignation") {
    if (!ensure(!!this.resignationDetails, "resignationDetails is required")) return;
  } else if (t === "data_update") {
    if (!ensure(!!this.dataUpdateDetails, "dataUpdateDetails is required")) return;
  }

  // ✅ only reach here on success
  next();
});

/* ---------------------------------- Indexes ---------------------------------- */
ApplicationSchema.index({ applicantId: 1, isDeleted: 1 }, { name: "idx_app_applicant_deleted" });
ApplicationSchema.index({ orgId: 1, currentStatus: 1, priority: 1 }, { name: "idx_app_org_status_priority" });
ApplicationSchema.index({ "approvers.approverId": 1, currentStatus: 1 }, { name: "idx_app_approver_status" });
ApplicationSchema.index({ fromDate: 1, toDate: 1 }, { name: "idx_app_date_range" });
ApplicationSchema.index({ applicationNo: 1 }, { name: "idx_app_no" });
ApplicationSchema.index(
  { title: "text", reason: "text", body: "text" },
  { weights: { title: 5, reason: 3, body: 1 }, name: "application_text_idx" }
);

/* ---------------------------------- Statics ---------------------------------- */
ApplicationSchema.statics.getActiveApplicationsByUser = function (userId: Types.ObjectId) {
  return this.find({ applicantId: userId, isDeleted: false, isCancelled: { $ne: true } }).sort({ createdAt: -1 });
};

ApplicationSchema.statics.getApplicationWithComments = function (appId: Types.ObjectId) {
  return this.findById(appId)
    .populate("applicantId", "personalInfo.name companyDetails.department.id companyDetails.designation.id")
    .populate("approvers.approverId", "personalInfo.name companyDetails.department.id companyDetails.designation.id")
    .lean();
};

ApplicationSchema.statics.isApplicationDeleted = async function (appId: Types.ObjectId) {
  const app = await this.findById(appId).select({ isDeleted: 1 });
  return app?.isDeleted ?? false;
};

ApplicationSchema.statics.getPendingApprovalsForApprover = function (approverId: Types.ObjectId) {
  return this.find({
    isDeleted: false,
    isCancelled: { $ne: true },
    currentStatus: { $in: ["pending", "in_review"] },
    approvers: { $elemMatch: { approverId, status: "pending" } },
  }).sort({ slaDueAt: 1, createdAt: -1 });
};

ApplicationSchema.statics.search = function (
  filters: Partial<{
    orgId: Types.ObjectId;
    type: string;
    status: ApplicationStatus;
    priority: ApplicationPriority;
    from: Date;
    to: Date;
    applicantId: Types.ObjectId;
    approverId: Types.ObjectId;
    departmentId: Types.ObjectId;
    designationId: Types.ObjectId;
    text: string;
  }> = {},
  paging: { limit?: number; page?: number; sort?: Record<string, 1 | -1> } = {}
) {
  const query: Record<string, any> = { isDeleted: false };

  if (filters.orgId) query.orgId = filters.orgId;
  if (filters.type) query.applicationType = filters.type;
  if (filters.status) query.currentStatus = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.applicantId) query.applicantId = filters.applicantId;
  if (filters.approverId) query["approvers.approverId"] = filters.approverId;
  if (filters.departmentId) query["applicantSnapshot.departmentId"] = filters.departmentId;
  if (filters.designationId) query["applicantSnapshot.designationId"] = filters.designationId;

  if (filters.from || filters.to) {
    query.$and = [
      { fromDate: { $lte: filters.to ?? new Date("2999-12-31") } },
      { toDate: { $gte: filters.from ?? new Date("1900-01-01") } },
    ];
  }

  if (filters.text) query.$text = { $search: filters.text };

  const limit = Math.max(1, Math.min(200, paging.limit ?? 20));
  const page = Math.max(1, paging.page ?? 1);
  const sort = paging.sort ?? { createdAt: -1 };

  return this.find(query).sort(sort).skip((page - 1) * limit).limit(limit);
};

ApplicationSchema.statics.listPaged = async function (filters = {}, paging = {}) {
  const cursor = this.search(filters as any, paging as any);
  const [data, total] = await Promise.all([cursor, this.countDocuments((cursor as any)._conditions)]);
  return { data, total };
};

ApplicationSchema.statics.addComment = function (
  appId: Types.ObjectId,
  stageIndex: number,
  comment: Omit<TCommentThread, "_id" | "createdAt"> & { createdAt?: Date }
) {
  const createdAt = comment.createdAt ?? new Date();
  return this.findOneAndUpdate(
    { _id: appId },
    {
      $set: { currentStatus: "in_review" as ApplicationStatus, updatedAt: createdAt },
      $push: {
        [`approvers.${stageIndex}.commentThread`]: { ...comment, createdAt },
        applicationStatusTimeline: {
          status: "commented",
          changedBy: new Types.ObjectId(comment.senderId),
          changedAt: createdAt,
          message: comment.message,
        },
        history: {
          status: "commented",
          actorId: new Types.ObjectId(comment.senderId),
          timestamp: createdAt,
          message: comment.message,
        },
      },
    },
    { new: true }
  );
};

ApplicationSchema.statics.advanceStage = async function (
  appId: Types.ObjectId,
  approverId: Types.ObjectId,
  action: "approve" | "reject" | "comment",
  payload?: { message?: string; rejectionReason?: string }
) {
  const app = await this.findById(appId);
  if (!app) return null;

  const idx = app.currentApproverIndex ?? 0;
  const stage = app.approvers[idx];
  if (!stage || String(stage.approverId) !== String(approverId)) return null;

  const now = new Date();

  if (action === "comment") {
    stage.status = "commented";
    stage.commentThread.push({
      senderId: approverId,
      role: "approver",
      message: payload?.message || "",
      createdAt: now,
    } as TCommentThread);
    app.history.push({ status: "commented", actorId: approverId, timestamp: now, message: payload?.message });
    app.applicationStatusTimeline.push({ status: "commented", changedBy: approverId, changedAt: now, message: payload?.message });
  }

  if (action === "approve") {
    stage.status = "approved";
    stage.approvedAt = now;
    app.history.push({ status: "approved", actorId: approverId, timestamp: now });
    app.applicationStatusTimeline.push({ status: "approved", changedBy: approverId, changedAt: now });

    if (idx + 1 < app.approvers.length) {
      app.currentApproverIndex = idx + 1;
      app.currentStatus = "in_review";
      app.history.push({ status: "forwarded", actorId: approverId, timestamp: now });
      app.applicationStatusTimeline.push({ status: "forwarded", changedBy: approverId, changedAt: now });
    } else {
      app.currentStatus = "approved";
      app.finalDecisionDate = now;
    }
  }

  if (action === "reject") {
    stage.status = "rejected";
    stage.rejectedAt = now;
    stage.rejectionReason = payload?.rejectionReason || "";
    app.currentStatus = "rejected";
    app.finalDecisionDate = now;
    app.history.push({ status: "rejected", actorId: approverId, timestamp: now, message: stage.rejectionReason });
    app.applicationStatusTimeline.push({ status: "rejected", changedBy: approverId, changedAt: now, message: stage.rejectionReason });
  }

  await app.save();
  return app;
};

ApplicationSchema.statics.cancelApplication = async function (appId: Types.ObjectId, cancelledBy: Types.ObjectId, reason?: string) {
  const now = new Date();
  const app = await this.findByIdAndUpdate(
    appId,
    {
      $set: {
        isCancelled: true,
        currentStatus: "cancelled",
        cancelledBy,
        cancelledAt: now,
        cancelReason: reason,
      },
      $push: {
        history: { status: "cancelled", actorId: cancelledBy, timestamp: now, message: reason },
        applicationStatusTimeline: { status: "cancelled", changedBy: cancelledBy, changedAt: now, message: reason },
      },
    },
    { new: true }
  );
  return app;
};

export const Application = model<TGeneralApplication, ApplicationModel>("Application", ApplicationSchema);
