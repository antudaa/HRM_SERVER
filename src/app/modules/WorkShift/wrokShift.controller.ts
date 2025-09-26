import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import { WorkShiftServices } from "./workShift.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

// Create Work Shift
const createWorkShift: RequestHandler = catchAsync(async (req, res) => {
    const result = await WorkShiftServices.createWorkShift(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Work shift created successfully.",
        data: result,
    });
});

// Update Work Shift
const updateWorkShift: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WorkShiftServices.updateWorkShift(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Work shift updated successfully.",
        data: result,
    });
});

// Archive Work Shift
const archivedWorkShift: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WorkShiftServices.archivedWorkShift(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Work shift archived successfully.",
        data: result,
    });
});

// Unarchive Work Shift
const unArchiveWorkShift: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WorkShiftServices.unArchiveWorkShift(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Work shift unarchived successfully.",
        data: result,
    });
});

// Delete Work Shift
const deleteWorkShift: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WorkShiftServices.deleteWorkShift(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Work shift deleted successfully.",
        data: result,
    });
});

// Get All Work Shifts
const getAllWorkShift: RequestHandler = catchAsync(async (_req, res) => {
    const result = await WorkShiftServices.getAllWorkShift();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All work shifts retrieved successfully.",
        data: result,
    });
});

// Get Active Work Shifts
const getActiveWorkShift: RequestHandler = catchAsync(async (_req, res) => {
    const result = await WorkShiftServices.getActiveWorkShift();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Active work shifts retrieved successfully.",
        data: result,
    });
});

// Get Archived Work Shifts
const getArchivedWorkShift: RequestHandler = catchAsync(async (_req, res) => {
    const result = await WorkShiftServices.getArchivedWorkShift();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Archived work shifts retrieved successfully.",
        data: result,
    });
});

// Get Work Shift By ID
const getWorkShiftByID: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WorkShiftServices.getWorkShiftByID(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Work shift retrieved successfully.",
        data: result,
    });
});

export const WorkShiftController = {
    createWorkShift,
    updateWorkShift,
    archivedWorkShift,
    unArchiveWorkShift,
    deleteWorkShift,
    getAllWorkShift,
    getActiveWorkShift,
    getArchivedWorkShift,
    getWorkShiftByID,
};
