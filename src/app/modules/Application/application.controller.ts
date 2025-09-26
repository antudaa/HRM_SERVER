import { RequestHandler } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ApplicationServices as S } from "./application.service";
import { ApplicationKind, ApplicationStatus, TApplicationSearchFilters, TPagination } from "./application.interface";
import { Application } from "./application.model";

/* ----------------------- helpers to parse query params ----------------------- */
const parseFilters = (q: any): TApplicationSearchFilters => {
  const filters: TApplicationSearchFilters = {};
  if (q.orgId) filters.orgId = q.orgId;
  if (q.type) filters.type = q.type as ApplicationKind;
  if (q.status) filters.status = q.status as ApplicationStatus;
  if (q.priority) filters.priority = q.priority as any;
  if (q.from) filters.from = new Date(q.from);
  if (q.to) filters.to = new Date(q.to);
  if (q.applicantId) filters.applicantId = q.applicantId;
  if (q.approverId) filters.approverId = q.approverId;
  if (q.departmentId) filters.departmentId = q.departmentId;
  if (q.designationId) filters.designationId = q.designationId;
  if (q.text) filters.text = String(q.text);
  return filters;
};

const parsePaging = (q: any): TPagination => {
  const page = Math.max(Number(q.page) || 1, 1);
  const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 100);
  let sort: TPagination["sort"];
  if (q.sort) {
    sort = {};
    String(q.sort)
      .split(",")
      .map((kv: string) => kv.trim())
      .filter(Boolean)
      .forEach((pair: string) => {
        const [k, dirRaw] = pair.split(":").map((s) => s.trim());
        (sort as any)[k] = (dirRaw?.toLowerCase() === "asc" ? 1 : -1) as 1 | -1;
      });
  }
  return { page, limit, sort };
};

/* --------------------------------- handlers --------------------------------- */

export const createApplication: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.createApplication(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Application created successfully.",
    data,
  });
});

export const getApplicationById: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.getById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application fetched.",
    data,
  });
});

export const listApplications: RequestHandler = catchAsync(async (req, res) => {
  const filters = parseFilters(req.query);
  const paging = parsePaging(req.query);
  const data = await S.listPaged(filters, paging);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Applications list fetched.",
    data,
  });
});

export const addComment: RequestHandler = catchAsync(async (req, res) => {
  const { stageIndex, senderId, role, message, attachments, replyTo } = req.body;
  const data = await S.addComment(req.params.id, Number(stageIndex), {
    senderId,
    role,
    message,
    attachments,
    replyTo,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment added.",
    data,
  });
});

// export const advanceStage: RequestHandler = catchAsync(async (req, res) => {
//   const appId = req.params.id;
//   const { action, message, rejectionReason } = req.body;

//   // 1) identity from token
//   const userId = (req as any).user?.id as string | undefined;
//   if (!userId) {
//     return sendResponse(res, {
//       statusCode: httpStatus.UNAUTHORIZED,
//       success: false,
//       message: "Missing/invalid token.",
//       data: null,
//     });
//   }

//   // Optional: admin override (only if your auth middleware sets roles)
//   const isAdmin = !!(req as any).user?.roles?.includes?.("super_admin");
//   const overrideApproverId: string | undefined = isAdmin ? (req.body.approverId as string | undefined) : undefined;

//   // 2) read app snapshot to validate authorization
//   const app = await Application.findById(appId).select("currentApproverIndex approvers currentStatus isCancelled").lean();
//   if (!app) {
//     return sendResponse(res, {
//       statusCode: httpStatus.NOT_FOUND,
//       success: false,
//       message: "Application not found.",
//       data: null,
//     });
//   }
//   if (app.isCancelled) {
//     return sendResponse(res, {
//       statusCode: httpStatus.FORBIDDEN,
//       success: false,
//       message: "Application is cancelled.",
//       data: null,
//     });
//   }
//   if (app.currentStatus === "approved") {
//     return sendResponse(res, {
//       statusCode: httpStatus.FORBIDDEN,
//       success: false,
//       message: "Application is already approved.",
//       data: null,
//     });
//   }

//   const idx = app.currentApproverIndex ?? 0;
//   const stage = app.approvers?.[idx];
//   if (!stage) {
//     return sendResponse(res, {
//       statusCode: httpStatus.CONFLICT,
//       success: false,
//       message: "No current approval stage to advance.",
//       data: null,
//     });
//   }
//   if (stage.status !== "pending") {
//     return sendResponse(res, {
//       statusCode: httpStatus.FORBIDDEN,
//       success: false,
//       message: "Current stage is not pending.",
//       data: null,
//     });
//   }

//   const currentApproverId = String(stage.approverId);

//   // 3) authorization: only the current approver can act, unless admin override
//   const effectiveApproverId = overrideApproverId ?? userId;
//   if (!isAdmin && effectiveApproverId !== currentApproverId) {
//     return sendResponse(res, {
//       statusCode: httpStatus.FORBIDDEN,
//       success: false,
//       message: "Not authorized to advance this stage.",
//       data: null,
//     });
//   }

//   // 4) perform action
//   const updated = await S.advanceStage(appId, effectiveApproverId, action, { message, rejectionReason });
//   if (!updated) {
//     return sendResponse(res, {
//       statusCode: httpStatus.FORBIDDEN,
//       success: false,
//       message: "Advance failed. Ensure you are the current pending approver.",
//       data: null,
//     });
//   }

//   return sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Stage updated.",
//     data: updated,
//   });
// });

export const advanceStage: RequestHandler = catchAsync(async (req, res) => {
  const appId = req.params.id;
  const { action, message, rejectionReason } = req.body;

  const userId = (req as any).user?.id as string | undefined; // from JWT
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Missing/invalid token.",
      data: null,
    });
  }

  // Admin role (your middleware sets this)
  const isAdmin = !!(req as any).user?.roles?.includes?.("super_admin");

  // --- DEV-ONLY impersonation (never enable in production) ---
  const devMode = process.env.NODE_ENV !== "production";
  const devActAsHeader = req.header("X-Act-As"); // approverId in header
  const devBodyApproverId = typeof req.body.approverId === "string" ? req.body.approverId : undefined;
  const devOverrideApproverId = devMode ? (devActAsHeader || devBodyApproverId) : undefined;

  // If super_admin, allow explicit override via body.approverId as before
  const effectiveOverrideFromAdmin = isAdmin ? devBodyApproverId : undefined;

  // Load snapshot to know who the current approver is
  const app = await Application.findById(appId)
    .select("currentApproverIndex approvers currentStatus isCancelled")
    .lean();

  if (!app) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Application not found.",
      data: null,
    });
  }
  if (app.isCancelled) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Application is cancelled.",
      data: null,
    });
  }
  if (app.currentStatus === "approved") {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Application is already approved.",
      data: null,
    });
  }

  const idx = app.currentApproverIndex ?? 0;
  const stage = app.approvers?.[idx];
  if (!stage) {
    return sendResponse(res, {
      statusCode: httpStatus.CONFLICT,
      success: false,
      message: "No current approval stage to advance.",
      data: null,
    });
  }
  if (stage.status !== "pending") {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Current stage is not pending.",
      data: null,
    });
  }

  const currentApproverId = String(stage.approverId);

  // Decide who is acting:
  // 1) admin override (prod-safe)
  // 2) dev impersonation (only when not production)
  // 3) default to userId from token
  const actingApproverId =
    effectiveOverrideFromAdmin ??
    devOverrideApproverId ??
    userId;

  // Logging (dev aid)
  if (devMode) {
    // eslint-disable-next-line no-console
    console.log("[advanceStage] userId:", userId,
                "| actingApproverId:", actingApproverId,
                "| currentApproverId:", currentApproverId,
                "| isAdmin:", isAdmin,
                "| action:", action);
  }

  // Authorization: must match current stage approver
  if (actingApproverId !== currentApproverId) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Not authorized to advance this stage.",
      data: null,
    });
  }

  const updated = await S.advanceStage(appId, actingApproverId, action, { message, rejectionReason });
  if (!updated) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Advance failed. Ensure you are the current pending approver.",
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stage updated.",
    data: updated,
  });
});

export const cancelApplication: RequestHandler = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id as string;
  // Typically only applicant (or admin) can cancel a non-approved app.
  // You can load the app & check ownership here (or perform check inside service).
  // Minimal example:
  // const app = await S.getById(req.params.id);
  // if (!app || String(app.applicantId) !== userId) { ...403... }

  const { cancelledBy, reason } = req.body;
  if (userId !== cancelledBy) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Not authorized to cancel this application.",
      data: null,
    });
  }
  const data = await S.cancelApplication(req.params.id, cancelledBy, reason);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application cancelled.",
    data,
  });
});

export const getActiveByUser: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.getActiveApplicationsByUser(req.params.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Active applications fetched.",
    data,
  });
});

export const getPendingForApprover: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.getPendingForApprover(req.params.approverId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pending approvals fetched.",
    data,
  });
});

export const ApplicationControllers = {
  createApplication,
  getApplicationById,
  listApplications,
  addComment,
  advanceStage,
  cancelApplication,
  getActiveByUser,
  getPendingForApprover,
};
