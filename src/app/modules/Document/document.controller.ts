import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import { DocumentServices } from "./document.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { extractUserIdFromRequest } from "../../middlewares/auth";

const createDocument: RequestHandler = catchAsync(async (req, res) => {
  const uploaderId = extractUserIdFromRequest(req);
  console.log(uploaderId);

  if (!uploaderId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Uploader ID missing from access token",
    });
  }

  const docData = {
    ...req.body,
    uploaderId,
    uploadDate: new Date(),
    lastUpdated: new Date(),
    isDeleted: false,
  };

  const result = await DocumentServices.createDocument(docData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Document created successfully.",
    data: result,
  });
});

const updateDocument: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.updateDocument(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document updated successfully.",
    data: result,
  });
});

const archiveDocument: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.archiveDocument(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document archived successfully.",
    data: result,
  });
});

const unarchiveDocument: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.unarchiveDocument(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document unarchived successfully.",
    data: result,
  });
});

const softDeleteDocument: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.softDeleteDocument(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document soft deleted successfully.",
    data: result,
  });
});

const hardDeleteDocument: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.hardDeleteDocument(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document permanently deleted.",
    data: result,
  });
});

const getAllDocuments: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.getAllDocuments();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All documents retrieved successfully.",
    data: result,
  });
});

const getActiveDocuments: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.getActiveDocuments();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Active documents retrieved successfully.",
    data: result,
  });
});

const getArchivedDocuments: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.getArchivedDocuments();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Archived documents retrieved successfully.",
    data: result,
  });
});

const getSingleDocument: RequestHandler = catchAsync(async (req, res) => {
  const result = await DocumentServices.getSingleDocument(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document retrieved successfully.",
    data: result,
  });
});

export const DocumentControllers = {
  createDocument,
  updateDocument,
  archiveDocument,
  unarchiveDocument,
  softDeleteDocument,
  hardDeleteDocument,
  getAllDocuments,
  getActiveDocuments,
  getArchivedDocuments,
  getSingleDocument,
};
