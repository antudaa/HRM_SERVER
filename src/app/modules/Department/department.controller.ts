import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import { DepartmentServices } from "./department.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createDepartment: RequestHandler = catchAsync(async (req, res) => {
    const result = await DepartmentServices.createDepartment(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department created successfully.',
        data: result,
    });
});

const updateDepartment: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const departmentUpdatedData = req.body;

    const result = await DepartmentServices.updateDepartment(id, departmentUpdatedData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const archivedDepartment: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DepartmentServices.archivedDepartment(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const unArchivedDepartment: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DepartmentServices.unArchiveDepartment(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const handDeleteDepartment: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DepartmentServices.deleteDepartment(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data updated successfully.',
        data: result,
    });
});

const getAllDepartments: RequestHandler = catchAsync(async (req, res) => {

    const result = await DepartmentServices.getAllDepartment();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data retrieved successfully.',
        data: result,
    });
});

const getActiveDepartments: RequestHandler = catchAsync(async (req, res) => {

    const result = await DepartmentServices.getActiveDepartment();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data retrieved successfully.',
        data: result,
    });
});

const getArchiveDepartments: RequestHandler = catchAsync(async (req, res) => {

    const result = await DepartmentServices.getArchiveDepartment();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data retrieved successfully.',
        data: result,
    });
});

const getDepartmentById: RequestHandler = catchAsync(async (req, res) => {

    const { id } = req.params;
    const result = await DepartmentServices.getDepartmentById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Department data retrieved successfully.',
        data: result,
    });
});

export const DepartmentControllers = { 
    createDepartment,
    updateDepartment,
    archivedDepartment,
    unArchivedDepartment,
    handDeleteDepartment,
    getAllDepartments,
    getActiveDepartments,
    getArchiveDepartments,
    getDepartmentById,
};