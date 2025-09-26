import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import { DesignationServices } from "./designation.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createDesignation: RequestHandler = catchAsync(async(req, res) => {
    const result = await DesignationServices.createDesignation(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Designation created Successfully.',
        data: result,
    })
});

const updateDesignation: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const designationUpdatedData = req.body;

    const result = await DesignationServices.updateDesignation(id, designationUpdatedData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const archiveDesignation: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DesignationServices.archiveDesignation(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const unArchiveDesignation: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DesignationServices.unArchiveDesignation(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const deleteDesignation: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DesignationServices.deleteDesignation(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const getActiveDesignations: RequestHandler = catchAsync(async (req, res) => {

    const result = await DesignationServices.getActiveDesignations();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const getArchiveDesignations: RequestHandler = catchAsync(async (req, res) => {

    const result = await DesignationServices.getArchiveDesignations();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const getAllDesignations: RequestHandler = catchAsync(async (req, res) => {

    const result = await DesignationServices.getAllDesignations();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const getDesignationById: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DesignationServices.getDesignationById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

export const DesignationControllers = {
    createDesignation,
    updateDesignation,
    archiveDesignation,
    unArchiveDesignation,
    deleteDesignation,
    getAllDesignations,
    getActiveDesignations,
    getArchiveDesignations,
    getDesignationById,
};