import { RequestHandler } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LeaveStatusServices } from "./leaveStatus.service";
import { Types } from "mongoose";

const getSingleEmployeeLeaveStatus: RequestHandler = catchAsync(async (req, res) => {
  const { employeeId } = req.params;
  const year = req.query.year ? Number(req.query.year) : undefined;

  const result = await LeaveStatusServices.getEmployeeLeaveStatus(
    new Types.ObjectId(employeeId),
    year
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee leave status fetched successfully.",
    data: result,
  });
});

const getAllEmployeesLeaveStatus: RequestHandler = catchAsync(async (req, res) => {
  const { year, orgId, departmentId, designationId, page, limit, search } = req.query;

  const result = await LeaveStatusServices.getAllEmployeesLeaveStatus({
    year: year ? Number(year) : undefined,
    orgId: orgId as string | undefined,
    departmentId: departmentId as string | undefined,
    designationId: designationId as string | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string | undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employees leave status fetched successfully.",
    data: result,
  });
});

export const LeaveStatusControllers = {
  getSingleEmployeeLeaveStatus,
  getAllEmployeesLeaveStatus,
};
