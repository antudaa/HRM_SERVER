// import { RequestHandler } from "express";
// import httpStatus from "http-status";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
// import { ApplicationServices as S } from "./leaveApplication.service";
// import { ApplicationKind, ApplicationStatus, TApplicationSearchFilters, TPagination } from "./leaveApplication.interface";

// const parseFilters = (q: any): TApplicationSearchFilters => {
//   const filters: TApplicationSearchFilters = {};
//   if (q.orgId) filters.orgId = q.orgId;
//   if (q.type) filters.type = q.type as ApplicationKind;
//   if (q.status) filters.status = q.status as ApplicationStatus;
//   if (q.priority) filters.priority = q.priority as any;
//   if (q.from) filters.from = new Date(q.from);
//   if (q.to) filters.to = new Date(q.to);
//   if (q.applicantId) filters.applicantId = q.applicantId;
//   if (q.approverId) filters.approverId = q.approverId;
//   if (q.departmentId) filters.departmentId = q.departmentId;
//   if (q.designationId) filters.designationId = q.designationId;
//   if (q.text) filters.text = String(q.text);
//   return filters;
// };

// const parsePaging = (q: any): TPagination => {
//   const page = Math.max(Number(q.page) || 1, 1);
//   const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 100);
//   let sort: TPagination["sort"];
//   if (q.sort) {
//     sort = {};
//     String(q.sort)
//       .split(",")
//       .map((kv: string) => kv.trim())
//       .filter(Boolean)
//       .forEach((pair: string) => {
//         const [k, dirRaw] = pair.split(":").map((s) => s.trim());
//         (sort as any)[k] = (dirRaw?.toLowerCase() === "asc" ? 1 : -1) as 1 | -1;
//       });
//   }
//   return { page, limit, sort };
// };

// export const createApplication: RequestHandler = catchAsync(async (req, res) => {
//   const data = await S.createApplication(req.body);
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Application created successfully.",
//     data,
//   });
// });

// export const getApplicationById: RequestHandler = catchAsync(async (req, res) => {
//   const data = await S.getById(req.params.id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Application fetched.",
//     data,
//   });
// });

// export const listApplications: RequestHandler = catchAsync(async (req, res) => {
//   const filters = parseFilters(req.query);
//   const paging = parsePaging(req.query);
//   const data = await S.listPaged(filters, paging);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Applications list fetched.",
//     data,
//   });
// });

// export const addComment: RequestHandler = catchAsync(async (req, res) => {
//   const { stageIndex, senderId, role, message, attachments, replyTo } = req.body;
//   const data = await S.addComment(req.params.id, Number(stageIndex), {
//     senderId, 
//     role,
//     message,
//     attachments,
//     replyTo,
//   });
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Comment added.",
//     data,
//   });
// });

// export const advanceStage: RequestHandler = catchAsync(async (req, res) => {
//   const { approverId, action, message, rejectionReason } = req.body;
//   const data = await S.advanceStage(req.params.id, approverId, action, { message, rejectionReason });
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Stage updated.",
//     data,
//   });
// });

// export const cancelApplication: RequestHandler = catchAsync(async (req, res) => {
//   const { cancelledBy, reason } = req.body;
//   const data = await S.cancelApplication(req.params.id, cancelledBy, reason);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Application cancelled.",
//     data,
//   });
// });

// export const getActiveByUser: RequestHandler = catchAsync(async (req, res) => {
//   const data = await S.getActiveApplicationsByUser(req.params.userId);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Active applications fetched.",
//     data,
//   });
// });

// export const getPendingForApprover: RequestHandler = catchAsync(async (req, res) => {
//   const data = await S.getPendingForApprover(req.params.approverId);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Pending approvals fetched.",
//     data,
//   });
// });

// export const ApplicationControllers = {
//   createApplication,
//   getApplicationById,
//   listApplications,
//   addComment,
//   advanceStage,
//   cancelApplication,
//   getActiveByUser,
//   getPendingForApprover,
// };
