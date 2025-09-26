import { Types, FilterQuery } from "mongoose";
import {
  ApplicationKind,
  ApplicationStatus,
  ApprovalStageStatus,
  TApplicationSearchFilters,
  TPagination,
  TGeneralApplication,
  TCommentThread,
  TApprovalStage,
} from "./application.interface";
import { Application } from "./application.model";
import { EmployeeLeaveBalance } from "../Leave/employeeLeaveBalance.model";
import { ApplicationNotifier } from "./application.notify";
import { LeaveType } from "../Leave/leaveManagement.model";
import { LeavePolicy } from "../Leave/leavePolicy.model";
import { ApplicationTemplateServices } from "../ApplicationTemplate/applicationTemplate.service";

/* -------------------------------------------------------------------------- */
/*                              Populate helpers                               */
/* -------------------------------------------------------------------------- */

/** Employee fields to reveal when populating IDs (safe + useful in UI) */
const EMP_POPULATE_SELECT =
  "personalInfo.name personalInfo.profileImage companyDetails.department.id companyDetails.designation.id";

/** LeaveType fields to reveal when populating leaveDetails.leaveTypeId */
const LEAVE_POPULATE_SELECT = "name code shortCode active usesAdjustmentBank";

/** Apply all needed populates to a Mongoose query or document */
function populateAll<T>(q: any) {
  return q
    .populate({ path: "applicantId", select: EMP_POPULATE_SELECT })
    .populate({ path: "approvers.approverId", select: EMP_POPULATE_SELECT })
    .populate({ path: "leaveDetails.leaveTypeId", select: LEAVE_POPULATE_SELECT });
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

type TCreateApplicationPayload = Omit<
  TGeneralApplication,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "isDeleted"
  | "history"
  | "applicationStatusTimeline"
> & {
  templateId?: string;
  templateVars?: Record<string, any>;
  history?: TGeneralApplication["history"];
  applicationStatusTimeline?: TGeneralApplication["applicationStatusTimeline"];
};

const buildFilters = (f?: TApplicationSearchFilters): FilterQuery<TGeneralApplication> => {
  const q: FilterQuery<TGeneralApplication> = { isDeleted: false };
  if (!f) return q;

  if (f.orgId) q.orgId = f.orgId as any;
  if (f.type) q.applicationType = f.type as ApplicationKind;
  if (f.status) q.currentStatus = f.status as ApplicationStatus;
  if (f.priority) q.priority = f.priority as any;
  if (f.applicantId) q.applicantId = f.applicantId as any;
  if (f.approverId) q["approvers.approverId"] = f.approverId as any;
  if (f.departmentId) q["applicantSnapshot.departmentId"] = f.departmentId as any;
  if (f.designationId) q["applicantSnapshot.designationId"] = f.designationId as any;

  if (f.from || f.to) {
    q.$and = [
      { fromDate: { $lte: f.to ?? new Date("2999-12-31") } },
      { toDate: { $gte: f.from ?? new Date("1900-01-01") } },
    ];
  }

  if (f.text && f.text.trim()) {
    const rx = new RegExp(f.text.trim(), "i");
    q.$or = [{ title: rx }, { reason: rx }, { body: rx }];
  }
  return q;
};

const buildPaging = (p?: TPagination) => {
  const page = Math.max(Number(p?.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(p?.limit ?? 20), 1), 100);
  const skip = (page - 1) * limit;
  const sort = p?.sort ?? { createdAt: -1 as const };
  return { page, limit, skip, sort };
};

function ensureBodyOrTemplate(p: { body?: string; templateId?: string }) {
  const hasBody = typeof p.body === "string" && p.body.trim().length > 0;
  if (!hasBody && !p.templateId) {
    throw new Error("Either 'body' or 'templateId' must be provided.");
  }
}

/** Promise timeout wrapper to prevent hangs on external calls (e.g., SMTP) */
function withTimeout<T>(p: Promise<T>, ms = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

/** Fire-and-forget notifier (never blocks HTTP response) */
function notifyAsync(fn: () => Promise<any>, timeoutMs = 5000) {
  try {
    setImmediate(() => {
      withTimeout(fn(), timeoutMs).catch((err) => {
        console.error("[Notifier] error:", err?.message || err);
      });
    });
  } catch {
    /* swallow */
  }
}

/** Adjustment helpers */
const getAdjustmentLeaveType = async () => {
  const byCode = process.env.ADJUSTMENT_LEAVE_CODE
    ? await LeaveType.findByCode(process.env.ADJUSTMENT_LEAVE_CODE)
    : null;
  if (byCode) return byCode;

  const lt = await (LeaveType as any).findOne({
    usesAdjustmentBank: true,
    isDeleted: false,
    active: true,
  });
  if (!lt) {
    throw new Error(
      "Adjustment bank leave type not configured. Set usesAdjustmentBank=true on a LeaveType or configure ADJUSTMENT_LEAVE_CODE."
    );
  }
  return lt;
};

const ensureAdjustmentSpendCapacity = async (
  employeeId: Types.ObjectId,
  year: number,
  days: number
) => {
  const adjType = await getAdjustmentLeaveType();
  const rows = await EmployeeLeaveBalance.getForEmployeeYear(employeeId, year);
  const row = rows.find((r) => String(r.leaveTypeId) === String(adjType._id));
  const available =
    row ? row.openingBalance + row.accrued + row.carryForward - row.used - row.encashed - row.pending : 0;
  if (available < days) {
    throw new Error(`Insufficient adjustment balance. Available: ${available}, requested: ${days}`);
  }
};

/** Derive approvers using policy or fallback env hints */
async function deriveApprovers(
  payload: Omit<TCreateApplicationPayload, "approvers">
): Promise<TApprovalStage[]> {
  if (payload.applicationType === "leave" && payload.leaveDetails?.leaveTypeId) {
    const year = new Date(payload.fromDate).getFullYear();
    const policy = await LeavePolicy.getActiveFor(
      payload.orgId as any,
      payload.leaveDetails.leaveTypeId as any,
      year
    );
    if (policy?.approval?.tiers?.length) {
      return policy.approval.tiers
        .map((t) => t.employeeId)
        .filter(Boolean)
        .map((eid) => ({
          approverId: eid!,
          status: "pending" as ApprovalStageStatus,
          commentThread: [],
        }));
    }
  }

  const pick = (...ids: (Types.ObjectId | string | undefined)[]) =>
    ids
      .filter(Boolean)
      .map((id) => ({
        approverId: new Types.ObjectId(String(id)),
        status: "pending" as ApprovalStageStatus,
        commentThread: [],
      }));

  const HR = process.env.DEFAULT_HR_APPROVER_ID;
  const FIN = process.env.DEFAULT_FINANCE_APPROVER_ID;
  const MGR = process.env.DEFAULT_MANAGER_APPROVER_ID;
  const ADMIN = process.env.DEFAULT_ADMIN_APPROVER_ID;

  switch (payload.applicationType) {
    case "leave":
    case "home_office":
      return pick(MGR, HR);
    case "adjustment":
      return pick(MGR, HR);
    case "business_trip":
      return pick(MGR, FIN, HR);
    case "business_trip_report":
      return pick(MGR, FIN);
    case "refund":
      return pick(MGR, FIN);
    case "resignation":
      return pick(MGR, HR, ADMIN);
    case "data_update":
      return pick(HR);
    default:
      return pick(MGR);
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Create                                   */
/* -------------------------------------------------------------------------- */

async function createApplication(payload: TCreateApplicationPayload) {
  ensureBodyOrTemplate(payload);

  const status: ApplicationStatus = payload.currentStatus ?? "pending";
  const now = new Date();

  // Template render (optional)
  if ((!payload.body || String(payload.body).trim() === "") && payload.templateId) {
    const { title, body, template } = await ApplicationTemplateServices.renderTemplate(
      payload.templateId,
      payload.templateVars ?? {}
    );
    if (!body) throw new Error("Template rendered empty body");
    payload.body = body;
    if (!payload.title && title) payload.title = title;

    if ((!payload.approvers || payload.approvers.length === 0) && template?.defaultApprovers?.length) {
      payload.approvers = template.defaultApprovers
        .filter((a) => a.employeeId)
        .map((a) => ({
          approverId: a.employeeId as Types.ObjectId,
          status: "pending" as ApprovalStageStatus,
          commentThread: [],
          commentsRequired: !!a.commentsRequired,
          dueAt: a.dueAfterDays ? new Date(Date.now() + a.dueAfterDays * 24 * 60 * 60 * 1000) : undefined,
        })) as unknown as TApprovalStage[];
    }
  }

  // Leave policy pre-check
  if (payload.applicationType === "leave" && payload.leaveDetails?.leaveTypeId) {
    const unitsRequested = payload.numberOfDays ?? 0;
    const can = await LeaveType.canApply(
      new Types.ObjectId(String(payload.leaveDetails.leaveTypeId)),
      new Types.ObjectId(String(payload.applicantId)),
      {
        from: new Date(payload.fromDate),
        to: new Date(payload.toDate),
        unitsRequested,
        hasDocs: (payload.attachments?.length ?? 0) > 0,
        isProbation: false,
        tenureDays: undefined,
      }
    );
    if (!can.ok) {
      throw new Error(
        `${can.reason ?? "Leave policy conditions not satisfied"}${can.requiresDocs ? " (document required)" : ""}`
      );
    }
  }

  // Adjustment capacity check
  if (payload.applicationType === "adjustment" && payload.adjustmentDetails?.mode === "spend") {
    const days = payload.adjustmentDetails.days;
    const year = new Date(payload.fromDate ?? Date.now()).getFullYear();
    await ensureAdjustmentSpendCapacity(new Types.ObjectId(payload.applicantId), year, days);
  }

  // Approvers
  const approvers: TApprovalStage[] =
    payload.approvers?.length
      ? payload.approvers.map((a) => ({
          approverId: new Types.ObjectId(String(a.approverId)),
          status: ("status" in a ? a.status : "pending") as ApprovalStageStatus,
          commentThread: a.commentThread ?? [],
          commentsRequired: a.commentsRequired ?? false,
          dueAt: a.dueAt,
        }))
      : await deriveApprovers(payload);

  // Create
  const created = await Application.create({
    ...payload,
    approvers,
    currentStatus: status,
    isDeleted: false,
    history: [
      ...(payload.history ?? []),
      { status: "submitted", actorId: payload.applicantId, timestamp: now, message: payload.reason },
    ],
    applicationStatusTimeline: [
      ...(payload.applicationStatusTimeline ?? []),
      { status: "submitted", changedBy: payload.applicantId, changedAt: now, message: payload.reason },
    ],
  });

  // Ledger (await: part of transactional effect)
  try {
    if (created.applicationType === "leave" && created.leaveDetails?.leaveTypeId) {
      const days = created.numberOfDays ?? 0;
      if (days > 0) {
        await EmployeeLeaveBalance.postLedgerAndRecompute({
          employeeId: created.applicantId as Types.ObjectId,
          leaveTypeId: created.leaveDetails.leaveTypeId as Types.ObjectId,
          year: new Date(created.fromDate).getFullYear(),
          type: "PENDING_ADD",
          days,
          applicationId: created._id as Types.ObjectId,
          note: "Leave request submitted",
        });
      }
    }
  } catch (e) {
    console.error("postLedgerAndRecompute failed:", (e as Error)?.message);
  }

  // Notifications: fire-and-forget
  notifyAsync(() => ApplicationNotifier.notifyFirstApprover(created as any), 5000);

  // ✅ Return populated doc (applicant, approvers, leaveType)
  const doc = await populateAll(Application.findById(created._id)).lean();
  return doc;
}

/* -------------------------------------------------------------------------- */
/*                                 Read & List                                */
/* -------------------------------------------------------------------------- */

async function getById(appId: string) {
  return populateAll(Application.findById(appId));
}

async function getActiveApplicationsByUser(userId: string) {
  return populateAll(
    Application.getActiveApplicationsByUser(new Types.ObjectId(userId))
  );
}

async function getPendingForApprover(approverId: string) {
  return populateAll(
    Application.getPendingApprovalsForApprover(new Types.ObjectId(approverId)) 
  );
}

async function search(filters?: TApplicationSearchFilters, paging?: TPagination) {
  const q = buildFilters(filters);
  const { sort } = buildPaging(paging);
  return populateAll(Application.find(q).sort(sort));
}

async function listPaged(filters?: TApplicationSearchFilters, paging?: TPagination) {
  const q = buildFilters(filters);
  const { page, limit, skip, sort } = buildPaging(paging);

  const cursor = populateAll(
    Application.find(q).sort(sort).skip(skip).limit(limit)
  );

  const [data, total] = await Promise.all([
    cursor,
    Application.countDocuments(q),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/* -------------------------------------------------------------------------- */
/*                                   Comments                                 */
/* -------------------------------------------------------------------------- */

async function addComment(
  appId: string,
  stageIndex: number,
  comment: Omit<TCommentThread, "_id" | "createdAt"> & { createdAt?: Date }
) {
  const setPath = `approvers.${stageIndex}.commentThread`;
  const now = new Date();

  const commentDoc = {
    senderId: new Types.ObjectId(comment.senderId),
    role: comment.role,
    message: comment.message,
    attachments: comment.attachments ?? [],
    createdAt: comment.createdAt ?? now,
    resolved: false,
    ...(comment.replyTo ? { replyTo: new Types.ObjectId(comment.replyTo) } : {}),
  };

  const updated = await populateAll(
    Application.findByIdAndUpdate(
      new Types.ObjectId(appId),
      {
        $set: { currentStatus: "in_review" as ApplicationStatus, updatedAt: now },
        $push: {
          [setPath]: commentDoc,
          applicationStatusTimeline: {
            status: "commented",
            changedBy: new Types.ObjectId(comment.senderId),
            changedAt: now,
            message: comment.message,
          },
          history: {
            status: "commented",
            actorId: new Types.ObjectId(comment.senderId),
            timestamp: now,
            message: comment.message,
          },
        },
      },
      { new: true }
    )
  );

  // Notify applicant (non-blocking) when approver comments
  if (updated && comment.role === "approver") {
    notifyAsync(() => ApplicationNotifier.notifyApplicantCommented(updated as any, comment.message), 5000);
  }

  return updated;
}

/* -------------------------------------------------------------------------- */
/*                               Stage Transitions                            */
/* -------------------------------------------------------------------------- */

async function advanceStage(
  appId: string,
  approverId: string,
  action: "approve" | "reject" | "comment",
  payload?: { message?: string; rejectionReason?: string }
) {
  const _id = new Types.ObjectId(appId);
  const approver = new Types.ObjectId(approverId);
  const now = new Date();

  const snap = await Application.findById(_id).select(
    "currentApproverIndex approvers applicantId applicationType adjustmentDetails leaveDetails numberOfDays fromDate"
  );
  if (!snap) return null;

  const idx = snap.currentApproverIndex ?? 0;
  const isLast = idx + 1 >= (snap.approvers?.length ?? 0);

  const baseMatch: any = { _id, isDeleted: false, isCancelled: { $ne: true }, currentApproverIndex: idx };
  baseMatch[`approvers.${idx}.approverId`] = approver;
  baseMatch[`approvers.${idx}.status`] = "pending";

  // Approve
  if (action === "approve") {
    const update: any = {
      $set: {
        updatedAt: now,
        [`approvers.${idx}.status`]: "approved" as ApprovalStageStatus,
        [`approvers.${idx}.approvedAt`]: now,
      },
      $push: {
        applicationStatusTimeline: {
          status: isLast ? "approved" : "forwarded",
          changedBy: approver,
          changedAt: now,
          message: payload?.message,
        },
        history: {
          status: isLast ? "approved" : "forwarded",
          actorId: approver,
          timestamp: now,
          message: payload?.message,
        },
      },
    };

    if (isLast) {
      update.$set.currentStatus = "approved" as ApplicationStatus;
      update.$set.finalDecisionDate = now;
    } else {
      update.$set.currentStatus = "pending" as ApplicationStatus;
      update.$set.currentApproverIndex = idx + 1;
    }

    const updated = await populateAll(
      Application.findOneAndUpdate(baseMatch, update, { new: true })
    );
    if (!updated) return null;

    // Final ledger effects
    try {
      const year = new Date(updated.fromDate as any).getFullYear();

      if (updated.applicationType === "leave" && (updated as any).leaveDetails?.leaveTypeId) {
        const days = (updated as any).numberOfDays ?? 0;
        if (days > 0 && isLast) {
          await EmployeeLeaveBalance.postLedgerAndRecompute({
            employeeId: updated.applicantId as unknown as Types.ObjectId,
            leaveTypeId: (updated as any).leaveDetails.leaveTypeId as Types.ObjectId,
            year,
            type: "PENDING_REMOVE",
            days,
            applicationId: updated._id as any,
            note: "Final approval: pending cleared",
          });
          await EmployeeLeaveBalance.postLedgerAndRecompute({
            employeeId: updated.applicantId as unknown as Types.ObjectId,
            leaveTypeId: (updated as any).leaveDetails.leaveTypeId as Types.ObjectId,
            year,
            type: "CONSUME",
            days,
            applicationId: updated._id as any,
            note: "Leave consumed",
          });
        }
      }

      if (isLast && updated.applicationType === "adjustment" && (updated as any).adjustmentDetails) {
        const adjType = await getAdjustmentLeaveType();
        const days = (updated as any).adjustmentDetails.days;
        const effectiveYear = new Date(
          (updated as any).adjustmentDetails.forDate ?? (updated as any).fromDate
        ).getFullYear();

        if ((updated as any).adjustmentDetails.mode === "earn") {
          await EmployeeLeaveBalance.postLedgerAndRecompute({
            employeeId: updated.applicantId as unknown as Types.ObjectId,
            leaveTypeId: adjType._id as Types.ObjectId,
            year: effectiveYear,
            type: "ADJUSTMENT",
            days,
            applicationId: updated._id as any,
            note: "Adjustment earned (approved)",
          });
        } else if ((updated as any).adjustmentDetails.mode === "spend") {
          await EmployeeLeaveBalance.postLedgerAndRecompute({
            employeeId: updated.applicantId as unknown as Types.ObjectId,
            leaveTypeId: adjType._id as Types.ObjectId,
            year: effectiveYear,
            type: "CONSUME",
            days,
            applicationId: updated._id as any,
            note: "Adjustment consumed (approved)",
          });
        }
      }
    } catch (e) {
      console.error("advanceStage final ledger failed:", (e as Error)?.message);
    }

    // Notifications (non-blocking)
    if (isLast) {
      notifyAsync(() => ApplicationNotifier.notifyApplicantApproved(updated as any), 5000);
    } else {
      notifyAsync(() => ApplicationNotifier.notifyNextApprover(updated as any, approver), 5000);
    }

    return updated;
  }

  // Reject
  if (action === "reject") {
    const updated = await populateAll(
      Application.findOneAndUpdate(
        baseMatch,
        {
          $set: {
            updatedAt: now,
            currentStatus: "rejected" as ApplicationStatus,
            finalDecisionDate: now,
            [`approvers.${idx}.status`]: "rejected" as ApprovalStageStatus,
            [`approvers.${idx}.rejectedAt`]: now,
            [`approvers.${idx}.rejectionReason`]: payload?.rejectionReason,
          },
          $push: {
            applicationStatusTimeline: {
              status: "rejected",
              changedBy: approver,
              changedAt: now,
              message: payload?.rejectionReason ?? payload?.message,
            },
            history: {
              status: "rejected",
              actorId: approver,
              timestamp: now,
              message: payload?.rejectionReason ?? payload?.message,
            },
          },
        },
        { new: true }
      )
    );
    if (!updated) return null;

    // Clear pending ledger for leave
    try {
      if (
        updated.applicationType === "leave" &&
        (updated as any).leaveDetails?.leaveTypeId
      ) {
        const days = (updated as any).numberOfDays ?? 0;
        const year = new Date(updated.fromDate as any).getFullYear();
        if (days > 0) {
          await EmployeeLeaveBalance.postLedgerAndRecompute({
            employeeId: updated.applicantId as unknown as Types.ObjectId,
            leaveTypeId: (updated as any).leaveDetails.leaveTypeId as Types.ObjectId,
            year,
            type: "PENDING_REMOVE",
            days,
            applicationId: updated._id as any,
            note: "Rejected: pending cleared",
          });
        }
      }
    } catch (e) {
      console.error("reject ledger cleanup failed:", (e as Error)?.message);
    }

    // Notify applicant (non-blocking)
    notifyAsync(() => ApplicationNotifier.notifyApplicantRejected(updated as any, payload?.rejectionReason), 5000);

    return updated;
  }

  // Comment
  if (action === "comment") {
    const updated = await populateAll(
      Application.findOneAndUpdate(
        baseMatch,
        {
          $set: { updatedAt: now, currentStatus: "in_review" as ApplicationStatus },
          $push: {
            applicationStatusTimeline: {
              status: "commented",
              changedBy: approver,
              changedAt: now,
              message: payload?.message,
            },
            history: {
              status: "commented",
              actorId: approver,
              timestamp: now,
              message: payload?.message,
            },
          },
        },
        { new: true }
      )
    );

    // Notify applicant (non-blocking)
    if (updated) {
      notifyAsync(() => ApplicationNotifier.notifyApplicantCommented(updated as any, payload?.message), 5000);
    }
    return updated;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                                   Cancel                                   */
/* -------------------------------------------------------------------------- */

async function cancelApplication(appId: string, cancelledBy: string, reason?: string) {
  const now = new Date();
  const _id = new Types.ObjectId(appId);
  const canceller = new Types.ObjectId(cancelledBy);

  const updated = await populateAll(
    Application.findOneAndUpdate(
      { _id, isDeleted: false, isCancelled: { $ne: true }, currentStatus: { $ne: "approved" } },
      {
        $set: {
          isCancelled: true,
          cancelledBy: canceller,
          cancelledAt: now,
          cancelReason: reason,
          currentStatus: "cancelled" as ApplicationStatus,
          updatedAt: now,
        },
        $push: {
          applicationStatusTimeline: { status: "cancelled", changedBy: canceller, changedAt: now, message: reason },
          history: { status: "cancelled", actorId: canceller, timestamp: now, message: reason },
        },
      },
      { new: true }
    )
  );

  if (updated) {
    // Clear pending for leave
    try {
      if (
        updated.applicationType === "leave" &&
        (updated as any).leaveDetails?.leaveTypeId
      ) {
        const days = (updated as any).numberOfDays ?? 0;
        const year = new Date(updated.fromDate as any).getFullYear();
        if (days > 0) {
          await EmployeeLeaveBalance.postLedgerAndRecompute({
            employeeId: updated.applicantId as unknown as Types.ObjectId,
            leaveTypeId: (updated as any).leaveDetails.leaveTypeId as Types.ObjectId,
            year,
            type: "PENDING_REMOVE",
            days,
            applicationId: updated._id as any,
            note: "Cancelled: pending cleared",
          });
        }
      }
    } catch (e) {
      console.error("cancel ledger cleanup failed:", (e as Error)?.message);
    }

    // Notify applicant (non-blocking)
    notifyAsync(() => ApplicationNotifier.notifyApplicantCancelled(updated as any, reason), 5000);
  }

  return updated;
}

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export const ApplicationServices = {
  createApplication,
  getById,
  getActiveApplicationsByUser,
  getPendingForApprover,
  search,
  listPaged,
  addComment,
  advanceStage,
  cancelApplication,
};
