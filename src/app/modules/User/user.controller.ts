// user.controller.ts
import { Request, Response } from "express";
import { CreateAdminPayload, CreateSuperAdminPayload, UserServices } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";

const createSuperAdminIntoDB = async (req: Request, res: Response) => {
  const result = await UserServices.createSuperAdminIntoDB(
    req.body as CreateSuperAdminPayload,
    (req.body as any).password
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `SuperAdmin account created successfully.`,
    data: result,
  });
};

const createAdminIntoDB = async (req: Request, res: Response) => {
  const result = await UserServices.createAdminIntoDB(
    req.body as CreateAdminPayload,
    (req.body as any).password
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Admin account created successfully.`,
    data: result,
  });
};

const createEmployeeIntoDB = async (req: Request, res: Response) => {
  const result = await UserServices.createEmployeeIntoDB(
    req.body,
    req.body.password
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Employee account created successfully.`,
    data: result,
  });
};

const getCurrentUserFromDB = async (req: Request, res: Response) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Authorization token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret_token as string
    ) as JwtPayload;

    const userId = decoded?.id;
    if (!userId) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await UserServices.getCurrentUser(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `User data fetched successfully.`,
      data: user,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const getAllUserInfo = async (_req: Request, res: Response) => {
  const result = await UserServices.getAllUser();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Users data fetched successfully.`,
    data: result,
  });
};

const getActiveUsersInfo = async (_req: Request, res: Response) => {
  const result = await UserServices.getActiveUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Active users data fetched successfully.`,
    data: result,
  });
};

const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User data retrieved successfully.`,
    data: result,
  });
};

const softDeleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.softDeleteUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User soft-deleted successfully.`,
    data: result,
  });
};

const deleteUserData = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.deleteUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User permanently deleted successfully.`,
    data: result,
  });
};

export const UserController = {
  createSuperAdminIntoDB,
  createAdminIntoDB,
  createEmployeeIntoDB,
  getCurrentUserFromDB,
  getAllUserInfo,
  getActiveUsersInfo,
  getUserById,
  softDeleteUser,
  deleteUserData,
};
