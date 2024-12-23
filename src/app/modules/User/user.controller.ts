import { Request, Response } from "express";
import { UserServices } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";


const createEmployeeIntoDB = async (req: Request, res: Response) => {
    const result = await UserServices.createEmployeeIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Employee created successfully.`,
        data: result,
    })
};

export const UserController = {
    createEmployeeIntoDB,
}