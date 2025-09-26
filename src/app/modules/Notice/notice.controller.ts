// src/app/modules/Notice/notice.controller.ts
import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import { NoticeServices } from "./notice.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { extractUserIdFromRequest } from "../../middlewares/auth";
import type { Request } from "express";

type RequestWithUser = Request & {
  user?: { _id?: string; id?: string; role?: string; email?: string };
  userId?: string; // your middleware sets this
};

const createNotice: RequestHandler = catchAsync(async (req: RequestWithUser, res) => {
  // Robust user id resolution
  const userId =
    req.user?._id ||
    req.user?.id ||
    req.userId ||
    (() => {
      try {
        return extractUserIdFromRequest(req);
      } catch {
        return undefined;
      }
    })();

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Authenticated user not found. Please login again.",
      data: null,
    });
  }

  // Never accept publishDate or createdBy from client; server controls these
  if ("publishDate" in req.body) delete (req.body as any).publishDate;
  if ("createdBy" in req.body) delete (req.body as any).createdBy;

  // If not department, remove noticeFor to avoid ObjectId casting errors
  if (req.body.noticeCategory !== "department") {
    delete (req.body as any).noticeFor;
  }

  // Set createdBy from the authenticated user
  (req.body as any).createdBy = userId;

  const result = await NoticeServices.createNotice(req.body as any);
  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Notice created successfully.",
    data: result,
  });
});

const updateNotice: RequestHandler = catchAsync(async (req: RequestWithUser, res) => {
  // Prevent client from changing these
  if ("publishDate" in req.body) delete (req.body as any).publishDate;
  if ("createdBy" in req.body) delete (req.body as any).createdBy;

  // Keep category rule on update
  if (req.body.noticeCategory && req.body.noticeCategory !== "department") {
    delete (req.body as any).noticeFor;
  }

  const result = await NoticeServices.updateNotice(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notice updated successfully.",
    data: result,
  });
});

// ... keep the rest of your controller same exports
export const NoticeControllers = {
  createNotice,
  getAllNotices: catchAsync(async (_, res) => {
    const result = await NoticeServices.getAllNotices();
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All notices fetched successfully.",
      data: result,
    });
  }),
  getActiveNotices: catchAsync(async (_, res) => {
    const result = await NoticeServices.getActiveNotices();
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active notices fetched successfully.",
      data: result,
    });
  }),
  getArchivedNotices: catchAsync(async (_, res) => {
    const result = await NoticeServices.getArchivedNotices();
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Archived notices fetched successfully.",
      data: result,
    });
  }),
  getNoticeById: catchAsync(async (req, res) => {
    const result = await NoticeServices.getNoticeById(req.params.id);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notice retrieved successfully.",
      data: result,
    });
  }),
  updateNotice,
  archiveNotice: catchAsync(async (req, res) => {
    const result = await NoticeServices.archiveNotice(req.params.id);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notice archived successfully.",
      data: result,
    });
  }),
  unarchiveNotice: catchAsync(async (req, res) => {
    const result = await NoticeServices.unarchiveNotice(req.params.id);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notice unarchived successfully.",
      data: result,
    });
  }),
  softDeleteNotice: catchAsync(async (req, res) => {
    const result = await NoticeServices.softDeleteNotice(req.params.id);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notice soft deleted successfully.",
      data: result,
    });
  }),
  deleteNotice: catchAsync(async (req, res) => {
    const result = await NoticeServices.deleteNotice(req.params.id);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notice deleted successfully.",
      data: result,
    });
  }),
};
