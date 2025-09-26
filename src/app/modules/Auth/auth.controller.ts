import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import config from "../../config";

const loginUser: RequestHandler = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);
    const { refreshToken, accessToken } = result;

    res.cookie('refreshToken', refreshToken, {
        secure: config.node_env === 'production',
        httpOnly: true,
        sameSite: 'strict',
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Logged in Successfully",
        data: {
            accessToken,
        }
    })
});

// Logout User
const logout: RequestHandler = catchAsync(async (req, res) => {
    await AuthServices.logout(res);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged out successfully.",
    });
});

export const AuthControllers = {
    loginUser,
    logout
}