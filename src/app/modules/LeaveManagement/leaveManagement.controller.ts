// import httpStatus from "http-status";
// import { RequestHandler } from "express";
// import { LeaveTypeServices } from "./leaveManagement.service";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";

// /* ------------------------- CRUD ------------------------- */

// // Create
// const createLeaveType: RequestHandler = catchAsync(async (req, res) => {
//   const userId = (req as any).user?.id;
//   const result = await LeaveTypeServices.createLeaveType(req.body, userId);
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Leave type created successfully.",
//     data: result,
//   });
// });

// // Update
// const updateLeaveType: RequestHandler = catchAsync(async (req, res) => {
//   const userId = (req as any).user?.id;
//   const result = await LeaveTypeServices.updateLeaveType(req.params.id, req.body, userId);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Leave type updated successfully.",
//     data: result,
//   });
// });

// // Archive / Unarchive / Toggle / Delete
// const archivedLeaveType: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.archivedLeaveType(req.params.id);
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Archived.", data: result });
// });

// const unArchiveLeaveType: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.unArchiveLeaveType(req.params.id);
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Unarchived.", data: result });
// });

// const toggleActive: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.toggleActive(req.params.id);
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Toggled active.", data: result });
// });

// const deleteLeaveType: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.deleteLeaveType(req.params.id);
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Deleted.", data: result });
// });

// /* ------------------------- Listings ------------------------- */
// const getLeaveTypes: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.getLeaveTypes(req.query);
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Fetched.", data: result });
// });

// const getAllLeaveType: RequestHandler = catchAsync(async (_req, res) => {
//   const result = await LeaveTypeServices.getAllLeaveType();
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Fetched.", data: result });
// });

// const getActiveLeaveType: RequestHandler = catchAsync(async (_req, res) => {
//   const result = await LeaveTypeServices.getActiveLeaveType();
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Fetched.", data: result });
// });

// const getArchiveLeaveType: RequestHandler = catchAsync(async (_req, res) => {
//   const result = await LeaveTypeServices.getArchiveLeaveType();
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Fetched.", data: result });
// });

// /* ------------------------- Lookups ------------------------- */
// const getLeaveTypeByCode: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.getLeaveTypeByCode(req.params.code);
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Fetched.", data: result });
// });

// const isCodeAvailable: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.isCodeAvailable(String(req.query.code || ""));
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Checked.", data: result });
// });

// const getLeaveTypeByID: RequestHandler = catchAsync(async (req, res) => {
//   const result = await LeaveTypeServices.getLeaveTypeByID(req.params.id);
//   sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Fetched.", data: result });
// });

// export const LeaveTypeControllers = {
//   createLeaveType,
//   updateLeaveType,
//   archivedLeaveType,
//   unArchiveLeaveType,
//   toggleActive,
//   deleteLeaveType,
//   getLeaveTypes,
//   getAllLeaveType,
//   getActiveLeaveType,
//   getArchiveLeaveType,
//   getLeaveTypeByCode,
//   isCodeAvailable,
//   getLeaveTypeByID,
// };
