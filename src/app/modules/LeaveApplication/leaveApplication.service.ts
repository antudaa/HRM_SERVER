// // src/modules/LeaveApplication/leaveApplication.service.ts
// import { Types, FilterQuery } from "mongoose";
// import {
//   ApplicationKind,
//   ApplicationStatus,
//   ApprovalStageStatus,
//   TApplicationSearchFilters,
//   TPagination,
//   TGeneralApplication,
//   TCommentThread,
// } from "./leaveApplication.interface";
// import { Application } from "./leaveApplication.model";
// import { EmployeeLeaveBalance } from "../LeaveTest/employeeLeaveBalance.model";
// import { ApplicationNotifier } from "./leaveApplication.notify";

// /* ------------------------------- Helpers ------------------------------- */

// const buildFilters = (f?: TApplicationSearchFilters): FilterQuery<TGeneralApplication> => {
//   const q: FilterQuery<TGeneralApplication> = {};
//   if (!f) return { isDeleted: false };
//   if (f.orgId) q.orgId = f.orgId;
//   if (f.type) q.applicationType = f.type;
//   if (f.status) q.currentStatus = f.status;
//   if (f.priority) q.priority = f.priority;
//   if (f.applicantId) q.applicantId = f.applicantId;
//   if (f.approverId) q["approvers.approverId"] = f.approverId;
//   if (f.departmentId) q["applicantSnapshot.departmentId"] = f.departmentId;
//   if (f.designationId) q["applicantSnapshot.designationId"] = f.designationId;

//   if (f.from || f.to) {
//     q.$and = [
//       { fromDate: { $lte: f.to ?? new Date("2999-12-31") } },
//       { toDate: { $gte: f.from ?? new Date("1900-01-01") } },
//     ];
//   }

//   if (f.text && f.text.trim()) {
//     const rx = new RegExp(f.text.trim(), "i");
//     q.$or = [{ title: rx }, { reason: rx }, { body: rx }];
//   }

//   q.isDeleted = false;
//   return q;
// };

// const buildPaging = (p?: TPagination) => {
//   const page = Math.max(Number(p?.page ?? 1), 1);
//   const limit = Math.min(Math.max(Number(p?.limit ?? 20), 1), 100);
//   const skip = (page - 1) * limit;
//   const sort = p?.sort ?? { createdAt: -1 as const };
//   return { page, limit, skip, sort };
// };

// /* ------------------------------- CRUD + Workflow ------------------------------- */

// /**
//  * Create application
//  * - Adds PENDING_ADD ledger (leave only)
//  * - Notifies first approver
//  */
// async function createApplication(
//   payload: Omit<
//     TGeneralApplication,
//     "_id" | "createdAt" | "updatedAt" | "isDeleted" | "history" | "applicationStatusTimeline"
//   > & Partial<Pick<TGeneralApplication, "history" | "applicationStatusTimeline">>
// ) {
//   const status: ApplicationStatus = payload.currentStatus ?? "pending";
//   const now = new Date();

//   const doc = await Application.create({
//     ...payload,
//     currentStatus: status,
//     isDeleted: false,
//     history: [
//       ...(payload.history ?? []),
//       { status: "submitted", actorId: payload.applicantId, timestamp: now, message: payload.reason },
//     ],
//     applicationStatusTimeline: [
//       ...(payload.applicationStatusTimeline ?? []),
//       { status: "submitted", changedBy: payload.applicantId, changedAt: now, message: payload.reason },
//     ],
//   });

//   // Ledger: add pending when it's a leave
//   try {
//     if (doc.applicationType === "leave" && doc.leaveDetails?.leaveTypeId) {
//       const days = doc.numberOfDays ?? 0;
//       if (days > 0) {
//         await EmployeeLeaveBalance.postLedgerAndRecompute({
//           employeeId: doc.applicantId as Types.ObjectId,
//           leaveTypeId: doc.leaveDetails.leaveTypeId as Types.ObjectId,
//           year: new Date(doc.fromDate).getFullYear(),
//           type: "PENDING_ADD",
//           days,
//           applicationId: doc._id as Types.ObjectId,
//           note: "Leave request submitted",
//         });
//       }
//     }
//   } catch (e) {
//     // Do not block creation if ledger fails—log or capture error in your logger
//     // console.error("Ledger on create failed:", e);
//   }

//   // Notify first approver
//   try {
//     await ApplicationNotifier.notifyFirstApprover(doc as any);
//   } catch (e) {
//     // console.error("Notify first approver failed:", e);
//   }

//   return doc;
// }

// async function getById(appId: string) {
//   return Application.findById(appId);
// }

// async function getActiveApplicationsByUser(userId: string) {
//   return Application.getActiveApplicationsByUser(new Types.ObjectId(userId));
// }

// async function getPendingForApprover(approverId: string) {
//   return Application.getPendingApprovalsForApprover(new Types.ObjectId(approverId));
// }

// /* ----------------------------- Search & List ---------------------------- */

// async function search(filters?: TApplicationSearchFilters, paging?: TPagination) {
//   const q = buildFilters(filters);
//   const { sort } = buildPaging(paging);
//   return Application.find(q).sort(sort);
// }

// async function listPaged(filters?: TApplicationSearchFilters, paging?: TPagination) {
//   const q = buildFilters(filters);
//   const { page, limit, skip, sort } = buildPaging(paging);
//   const [data, total] = await Promise.all([
//     Application.find(q).sort(sort).skip(skip).limit(limit),
//     Application.countDocuments(q),
//   ]);
//   return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
// }

// /* --------------------------- Comments / Workflow ------------------------ */

// async function addComment(
//   appId: string,
//   stageIndex: number,
//   comment: Omit<TCommentThread, "_id" | "createdAt"> & { createdAt?: Date }
// ) {
//   const setPath = `approvers.${stageIndex}.commentThread`;
//   const now = new Date();

//   const commentDoc = {
//     senderId: new Types.ObjectId(comment.senderId),
//     role: comment.role,
//     message: comment.message,
//     attachments: comment.attachments ?? [],
//     createdAt: comment.createdAt ?? now,
//     resolved: false,
//     ...(comment.replyTo ? { replyTo: new Types.ObjectId(comment.replyTo) } : {}),
//   };

//   const updated = await Application.findByIdAndUpdate(
//     new Types.ObjectId(appId),
//     {
//       $set: { currentStatus: "in_review" as ApplicationStatus, updatedAt: now },
//       $push: {
//         [setPath]: commentDoc,
//         applicationStatusTimeline: {
//           status: "commented",
//           changedBy: new Types.ObjectId(comment.senderId),
//           changedAt: now,
//           message: comment.message,
//         },
//         history: {
//           status: "commented",
//           actorId: new Types.ObjectId(comment.senderId),
//           timestamp: now,
//           message: comment.message,
//         },
//       },
//     },
//     { new: true }
//   );

//   // Notify applicant (only when commenter is an approver)
//   try {
//     if (updated && comment.role === "approver") {
//       await ApplicationNotifier.notifyApplicantCommented(updated as any, comment.message);
//     }
//   } catch { }

//   return updated;
// }

// async function advanceStage(
//   appId: string,
//   approverId: string,
//   action: "approve" | "reject" | "comment",
//   payload?: { message?: string; rejectionReason?: string }
// ) {
//   const app = await Application.findById(appId);
//   if (!app) return null;

//   const idx = app.currentApproverIndex ?? 0;
//   const stage = app.approvers[idx];
//   if (!stage) return null;
//   if (String(stage.approverId) !== String(approverId)) return null;

//   const now = new Date();
//   const updates: any = { $set: { updatedAt: now } };
//   const pushes: any = {};

//   if (action === "approve") {
//     updates.$set[`approvers.${idx}.status`] = "approved" as ApprovalStageStatus;
//     updates.$set[`approvers.${idx}.approvedAt`] = now;

//     const nextIdx = idx + 1;
//     const isLast = nextIdx >= app.approvers.length;

//     if (isLast) {
//       updates.$set.currentStatus = "approved" as ApplicationStatus;
//       updates.$set.finalDecisionDate = now;
//       pushes.applicationStatusTimeline = { status: "approved", changedBy: new Types.ObjectId(approverId), changedAt: now, message: payload?.message };
//       pushes.history = { status: "approved", actorId: new Types.ObjectId(approverId), timestamp: now, message: payload?.message };
//     } else {
//       updates.$set.currentApproverIndex = nextIdx;
//       updates.$set.currentStatus = "pending" as ApplicationStatus;
//       pushes.applicationStatusTimeline = { status: "forwarded", changedBy: new Types.ObjectId(approverId), changedAt: now, message: payload?.message };
//       pushes.history = { status: "forwarded", actorId: new Types.ObjectId(approverId), timestamp: now, message: payload?.message };
//     }

//     if (Object.keys(pushes).length) updates.$push = pushes;

//     const updated = await Application.findByIdAndUpdate(new Types.ObjectId(appId), updates, { new: true });

//     // Ledger transitions + notifications
//     if (updated) {
//       try {
//         if (updated.applicationType === "leave" && updated.leaveDetails?.leaveTypeId) {
//           const days = updated.numberOfDays ?? 0;
//           const year = new Date(updated.fromDate).getFullYear();

//           if (isLast && days > 0) {
//             // Remove pending and add consumed
//             await EmployeeLeaveBalance.postLedgerAndRecompute({
//               employeeId: updated.applicantId as Types.ObjectId,
//               leaveTypeId: updated.leaveDetails.leaveTypeId as Types.ObjectId,
//               year,
//               type: "PENDING_REMOVE",
//               days,
//               applicationId: updated._id as Types.ObjectId,
//               note: "Final approval: pending cleared",
//             });
//             await EmployeeLeaveBalance.postLedgerAndRecompute({
//               employeeId: updated.applicantId as Types.ObjectId,
//               leaveTypeId: updated.leaveDetails.leaveTypeId as Types.ObjectId,
//               year,
//               type: "CONSUME",
//               days,
//               applicationId: updated._id as Types.ObjectId,
//               note: "Leave consumed",
//             });
//           }
//         }
//       } catch { }

//       try {
//         if (isLast) {
//           await ApplicationNotifier.notifyApplicantApproved(updated as any);
//         } else {
//           await ApplicationNotifier.notifyNextApprover(updated as any, new Types.ObjectId(approverId));
//         }
//       } catch { }
//     }

//     return updated;
//   }

//   if (action === "reject") {
//     updates.$set[`approvers.${idx}.status`] = "rejected" as ApprovalStageStatus;
//     updates.$set[`approvers.${idx}.rejectedAt`] = now;
//     updates.$set[`approvers.${idx}.rejectionReason`] = payload?.rejectionReason;
//     updates.$set.currentStatus = "rejected" as ApplicationStatus;
//     updates.$set.finalDecisionDate = now;

//     pushes.applicationStatusTimeline = { status: "rejected", changedBy: new Types.ObjectId(approverId), changedAt: now, message: payload?.rejectionReason ?? payload?.message };
//     pushes.history = { status: "rejected", actorId: new Types.ObjectId(approverId), timestamp: now, message: payload?.rejectionReason ?? payload?.message };

//     updates.$push = pushes;

//     const updated = await Application.findByIdAndUpdate(new Types.ObjectId(appId), updates, { new: true });

//     // Remove pending if leave
//     if (updated) {
//       try {
//         if (updated.applicationType === "leave" && updated.leaveDetails?.leaveTypeId) {
//           const days = updated.numberOfDays ?? 0;
//           const year = new Date(updated.fromDate).getFullYear();
//           if (days > 0) {
//             await EmployeeLeaveBalance.postLedgerAndRecompute({
//               employeeId: updated.applicantId as Types.ObjectId,
//               leaveTypeId: updated.leaveDetails.leaveTypeId as Types.ObjectId,
//               year,
//               type: "PENDING_REMOVE",
//               days,
//               applicationId: updated._id as Types.ObjectId,
//               note: "Rejected: pending cleared",
//             });
//           }
//         }
//       } catch { }
//       try {
//         await ApplicationNotifier.notifyApplicantRejected(updated as any, payload?.rejectionReason);
//       } catch { }
//     }

//     return updated;
//   }

//   if (action === "comment") {
//     updates.$set.currentStatus = "in_review" as ApplicationStatus;
//     pushes.applicationStatusTimeline = { status: "commented", changedBy: new Types.ObjectId(approverId), changedAt: now, message: payload?.message };
//     pushes.history = { status: "commented", actorId: new Types.ObjectId(approverId), timestamp: now, message: payload?.message };
//     updates.$push = pushes;

//     const updated = await Application.findByIdAndUpdate(new Types.ObjectId(appId), updates, { new: true });

//     try {
//       if (updated) await ApplicationNotifier.notifyApplicantCommented(updated as any, payload?.message);
//     } catch { }

//     return updated;
//   }

//   return null;
// }

// async function cancelApplication(appId: string, cancelledBy: string, reason?: string) {
//   const now = new Date();

//   const updated = await Application.findByIdAndUpdate(
//     new Types.ObjectId(appId),
//     {
//       $set: {
//         isCancelled: true,
//         cancelledBy: new Types.ObjectId(cancelledBy),
//         cancelledAt: now,
//         cancelReason: reason,
//         currentStatus: "cancelled" as ApplicationStatus,
//         updatedAt: now,
//       },
//       $push: {
//         applicationStatusTimeline: {
//           status: "cancelled",
//           changedBy: new Types.ObjectId(cancelledBy),
//           changedAt: now,
//           message: reason,
//         },
//         history: {
//           status: "cancelled",
//           actorId: new Types.ObjectId(cancelledBy),
//           timestamp: now,
//           message: reason,
//         },
//       },
//     },
//     { new: true }
//   );

//   // Remove pending if leave
//   if (updated) {
//     try {
//       if (updated.applicationType === "leave" && updated.leaveDetails?.leaveTypeId) {
//         const days = updated.numberOfDays ?? 0;
//         const year = new Date(updated.fromDate).getFullYear();
//         if (days > 0) {
//           await EmployeeLeaveBalance.postLedgerAndRecompute({
//             employeeId: updated.applicantId as Types.ObjectId,
//             leaveTypeId: updated.leaveDetails.leaveTypeId as Types.ObjectId,
//             year,
//             type: "PENDING_REMOVE",
//             days,
//             applicationId: updated._id as Types.ObjectId,
//             note: "Cancelled: pending cleared",
//           });
//         }
//       }
//     } catch { }
//     try {
//       await ApplicationNotifier.notifyApplicantCancelled(updated as any, reason);
//     } catch { }
//   }

//   return updated;
// }

// /* -------------------------------- Exports ------------------------------- */

// export const ApplicationServices = {
//   // create/read
//   createApplication,
//   getById,
//   getActiveApplicationsByUser,
//   getPendingForApprover,

//   // search/list
//   search,
//   listPaged,

//   // workflow
//   addComment,
//   advanceStage,
//   cancelApplication,
// };
