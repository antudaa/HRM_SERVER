// import { Schema, model, Types } from "mongoose";
// import {
//     TGeneralApplication,
//     ApplicationModel,
//     TCommentThread,
//     TApprovalStage,
//     TLeaveApplicationDetails,
//     TApplicationStatusTimeline,
//     ApplicationStatus,
//     ApplicationPriority,
// } from "./leaveApplication.interface";

// /* Comment thread */
// const CommentThreadSchema = new Schema<TCommentThread>(
//     {
//         senderId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
//         role: { type: String, enum: ["applicant", "approver"], required: true },
//         message: { type: String, required: true },
//         createdAt: { type: Date, default: Date.now },
//         attachments: [{ type: String }],
//         replyTo: { type: Schema.Types.ObjectId },
//         resolved: { type: Boolean, default: false },
//     },
//     { _id: true }
// );

// /* Approval stage */
// const ApprovalStageSchema = new Schema<TApprovalStage>(
//     {
//         approverId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
//         status: {
//             type: String,
//             enum: ["pending", "approved", "rejected", "commented", "skipped"],
//             default: "pending",
//         },
//         commentThread: { type: [CommentThreadSchema], default: [] },
//         approvedAt: { type: Date },
//         rejectedAt: { type: Date },
//         rejectionReason: { type: String },
//         commentsRequired: { type: Boolean, default: false },
//         delegatedTo: { type: Schema.Types.ObjectId, ref: "Employee" },
//         escalatedTo: { type: Schema.Types.ObjectId, ref: "Employee" },
//         dueAt: { type: Date },
//     },
//     { _id: false }
// );

// /* Leave details */
// const LeaveApplicationDetailsSchema = new Schema<TLeaveApplicationDetails>(
//     {
//         leaveMode: { type: String, enum: ["single", "multiple", "halfday"], required: true },
//         leaveTypeId: { type: Schema.Types.ObjectId, ref: "LeaveType", required: true },
//         halfDaySession: { type: String, enum: ["morning", "afternoon"] },
//         adjustmentReason: { type: String },
//         adjustedDate: { type: Date },
//         expectedDeliveryDate: { type: Date },
//         childBirthDate: { type: Date },
//         effectiveDates: [{ type: Date }],
//     },
//     { _id: false }
// );

// /* Status timeline */
// const ApplicationStatusTimelineSchema = new Schema<TApplicationStatusTimeline>(
//     {
//         status: {
//             type: String,
//             enum: ["created", "submitted", "forwarded", "commented", "approved", "rejected", "cancelled", "restored"],
//             required: true,
//         },
//         changedBy: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
//         changedAt: { type: Date, default: Date.now },
//         message: { type: String },
//     },
//     { _id: false }
// );

// /* Main application */
// const ApplicationSchema = new Schema<TGeneralApplication, ApplicationModel>(
//     {
//         orgId: { type: Schema.Types.ObjectId, ref: "Organization" },

//         applicationType: {
//             type: String,
//             enum: ["leave", "adjustment", "business_trip", "refund", "resignation", "home_office"],
//             required: true,
//         },

//         applicantId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
//         applicantSnapshot: {
//             employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
//             name: { type: String },
//             departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
//             designationId: { type: Schema.Types.ObjectId, ref: "Designation" },
//         },

//         applicationNo: { type: String, index: true },
//         title: { type: String },

//         numberOfDays: { type: Number, required: true, min: 0 },
//         fromDate: { type: Date, required: true },
//         toDate: { type: Date, required: true },
//         reason: { type: String, required: true },
//         body: { type: String, required: true },

//         approvers: { type: [ApprovalStageSchema], required: true },
//         currentApproverIndex: { type: Number, default: 0 },
//         currentStatus: {
//             type: String,
//             enum: ["draft", "in_review", "pending", "approved", "rejected", "cancelled"],
//             default: "pending",
//             index: true,
//         },
//         priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal", index: true },
//         slaDueAt: { type: Date },
//         finalDecisionDate: { type: Date },

//         ccWatchers: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
//         visibility: { type: String, enum: ["private", "department", "org"], default: "private" },

//         isCancelled: { type: Boolean, default: false },
//         cancelledBy: { type: Schema.Types.ObjectId, ref: "Employee" },
//         cancelledAt: { type: Date },
//         cancelReason: { type: String },

//         history: [
//             {
//                 status: {
//                     type: String,
//                     enum: ["created", "submitted", "forwarded", "commented", "approved", "rejected", "cancelled", "restored"],
//                     required: true,
//                 },
//                 actorId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
//                 timestamp: { type: Date, default: Date.now },
//                 message: { type: String },
//             },
//         ],
//         applicationStatusTimeline: { type: [ApplicationStatusTimelineSchema], default: [] },

//         attachments: [{ type: String }],
//         relatedApplicationId: { type: Schema.Types.ObjectId, ref: "Application" },
//         remarks: { type: String },

//         leaveDetails: { type: LeaveApplicationDetailsSchema },

//         isDeleted: { type: Boolean, default: false },
//     },
//     { timestamps: true }
// );

// ApplicationSchema.pre("validate", function (next) {
//     if (this.applicationType === "leave" && !this.leaveDetails) {
//         return next(new Error("leaveDetails is required when applicationType is 'leave'"));
//     }
//     return next();
// });

// /* Indexes */
// ApplicationSchema.index({ applicantId: 1, isDeleted: 1 }, { name: "idx_app_applicant_deleted" });
// ApplicationSchema.index({ orgId: 1, currentStatus: 1, priority: 1 }, { name: "idx_app_org_status_priority" });
// ApplicationSchema.index({ "approvers.approverId": 1, currentStatus: 1 }, { name: "idx_app_approver_status" });
// ApplicationSchema.index({ fromDate: 1, toDate: 1 }, { name: "idx_app_date_range" });
// ApplicationSchema.index({ applicationNo: 1 }, { name: "idx_app_no" });
// ApplicationSchema.index(
//     { title: "text", reason: "text", body: "text" },
//     { weights: { title: 5, reason: 3, body: 1 }, name: "application_text_idx" }
// );

// /* Statics */
// ApplicationSchema.statics.getActiveApplicationsByUser = function (userId: Types.ObjectId) {
//     return this.find({ applicantId: userId, isDeleted: false, isCancelled: { $ne: true } }).sort({ createdAt: -1 });
// };

// ApplicationSchema.statics.getApplicationWithComments = function (appId: Types.ObjectId) {
//     return this.findById(appId)
//         .populate("applicantId", "personalInfo.name companyDetails.department.id companyDetails.designation.id")
//         .populate("approvers.approverId", "personalInfo.name companyDetails.department.id companyDetails.designation.id")
//         .lean();
// };

// ApplicationSchema.statics.isApplicationDeleted = async function (appId: Types.ObjectId) {
//     const app = await this.findById(appId).select({ isDeleted: 1 });
//     return app?.isDeleted ?? false;
// };

// ApplicationSchema.statics.getPendingApprovalsForApprover = function (approverId: Types.ObjectId) {
//     return this.find({
//         isDeleted: false,
//         isCancelled: { $ne: true },
//         currentStatus: { $in: ["pending", "in_review"] },
//         approvers: { $elemMatch: { approverId, status: "pending" } },
//     }).sort({ slaDueAt: 1, createdAt: -1 });
// };

// ApplicationSchema.statics.search = function (
//     filters: Partial<{
//         orgId: Types.ObjectId;
//         type: string;
//         status: ApplicationStatus;
//         priority: ApplicationPriority;
//         from: Date;
//         to: Date;
//         applicantId: Types.ObjectId;
//         approverId: Types.ObjectId;
//         departmentId: Types.ObjectId;
//         designationId: Types.ObjectId;
//         text: string;
//     }> = {},
//     paging: { limit?: number; page?: number; sort?: Record<string, 1 | -1> } = {}
// ) {
//     const query: Record<string, any> = { isDeleted: false };

//     if (filters.orgId) query.orgId = filters.orgId;
//     if (filters.type) query.applicationType = filters.type;
//     if (filters.status) query.currentStatus = filters.status;
//     if (filters.priority) query.priority = filters.priority;
//     if (filters.applicantId) query.applicantId = filters.applicantId;
//     if (filters.approverId) query["approvers.approverId"] = filters.approverId;
//     if (filters.departmentId) query["applicantSnapshot.departmentId"] = filters.departmentId;
//     if (filters.designationId) query["applicantSnapshot.designationId"] = filters.designationId;

//     if (filters.from || filters.to) {
//         query.$and = [
//             { fromDate: { $lte: filters.to ?? new Date("2999-12-31") } },
//             { toDate: { $gte: filters.from ?? new Date("1900-01-01") } },
//         ];
//     }

//     if (filters.text) query.$text = { $search: filters.text };

//     const limit = Math.max(1, Math.min(200, paging.limit ?? 20));
//     const page = Math.max(1, paging.page ?? 1);
//     const sort = paging.sort ?? { createdAt: -1 };

//     return this.find(query).sort(sort).skip((page - 1) * limit).limit(limit);
// };

// ApplicationSchema.statics.listPaged = async function (filters = {}, paging = {}) {
//     const cursor = this.search(filters as any, paging as any);
//     const [data, total] = await Promise.all([cursor, this.countDocuments((cursor as any)._conditions)]);
//     return { data, total };
// };

// ApplicationSchema.statics.addComment = function (
//     appId: Types.ObjectId,
//     stageIndex: number,
//     comment: Omit<TCommentThread, "_id" | "createdAt"> & { createdAt?: Date }
// ) {
//     const createdAt = comment.createdAt ?? new Date();
//     return this.findOneAndUpdate(
//         { _id: appId },
//         { $push: { [`approvers.${stageIndex}.commentThread`]: { ...comment, createdAt } } },
//         { new: true }
//     );
// };

// ApplicationSchema.statics.advanceStage = async function (
//     appId: Types.ObjectId,
//     approverId: Types.ObjectId,
//     action: "approve" | "reject" | "comment",
//     payload?: { message?: string; rejectionReason?: string }
// ) {
//     const app = await this.findById(appId);
//     if (!app) return null;

//     const idx = app.currentApproverIndex ?? 0;
//     const stage = app.approvers[idx];
//     if (!stage || String(stage.approverId) !== String(approverId)) return null;

//     const now = new Date();

//     if (action === "comment") {
//         stage.status = "commented";
//         stage.commentThread.push({
//             senderId: approverId,
//             role: "approver",
//             message: payload?.message || "",
//             createdAt: now,
//         } as TCommentThread);
//         app.history.push({ status: "commented", actorId: approverId, timestamp: now, message: payload?.message });
//         app.applicationStatusTimeline.push({ status: "commented", changedBy: approverId, changedAt: now, message: payload?.message });
//     }

//     if (action === "approve") {
//         stage.status = "approved";
//         stage.approvedAt = now;
//         app.history.push({ status: "approved", actorId: approverId, timestamp: now });
//         app.applicationStatusTimeline.push({ status: "approved", changedBy: approverId, changedAt: now });

//         if (idx + 1 < app.approvers.length) {
//             app.currentApproverIndex = idx + 1;
//             app.currentStatus = "in_review";
//             app.history.push({ status: "forwarded", actorId: approverId, timestamp: now });
//             app.applicationStatusTimeline.push({ status: "forwarded", changedBy: approverId, changedAt: now });
//         } else {
//             app.currentStatus = "approved";
//             app.finalDecisionDate = now;
//         }
//     }

//     if (action === "reject") {
//         stage.status = "rejected";
//         stage.rejectedAt = now;
//         stage.rejectionReason = payload?.rejectionReason || "";
//         app.currentStatus = "rejected";
//         app.finalDecisionDate = now;
//         app.history.push({ status: "rejected", actorId: approverId, timestamp: now, message: stage.rejectionReason });
//         app.applicationStatusTimeline.push({ status: "rejected", changedBy: approverId, changedAt: now, message: stage.rejectionReason });
//     }

//     await app.save();
//     return app;
// };

// ApplicationSchema.statics.cancelApplication = async function (appId: Types.ObjectId, cancelledBy: Types.ObjectId, reason?: string) {
//     const now = new Date();
//     const app = await this.findByIdAndUpdate(
//         appId,
//         {
//             $set: {
//                 isCancelled: true,
//                 currentStatus: "cancelled",
//                 cancelledBy,
//                 cancelledAt: now,
//                 cancelReason: reason,
//             },
//             $push: {
//                 history: { status: "cancelled", actorId: cancelledBy, timestamp: now, message: reason },
//                 applicationStatusTimeline: { status: "cancelled", changedBy: cancelledBy, changedAt: now, message: reason },
//             },
//         },
//         { new: true }
//     );
//     return app;
// };

// export const Application = model<TGeneralApplication, ApplicationModel>("Application", ApplicationSchema);
