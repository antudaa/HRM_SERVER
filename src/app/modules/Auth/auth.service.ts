import httpStatus from "http-status";
import AppError from "../../Errors/AppError";
import { User } from "../User/user.model";
import { TLoginUser, TPasswordChange } from "./auth.interface";
import { createToken } from "./auth.utils";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLE } from "../Employee/constant";
import { Response } from "express";

export const roleMapping: { [key in USER_ROLE]: "SuperAdmin" | "Admin" | "Employee" | "HR" | "Manager" } = {
  [USER_ROLE.SuperAdmin]: "SuperAdmin",
  [USER_ROLE.Admin]: "Admin",
  [USER_ROLE.Employee]: "Employee",
  [USER_ROLE.HR]: "HR",
  [USER_ROLE.Manager]: "Manager",
};

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByEmail(payload?.email);
  if (!user || !user._id) throw new AppError(httpStatus.NOT_FOUND, "User not found or invalid _id!");

  if (await User.isUserDeleted(payload?.email)) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const matched = await User.isPasswordMatched(payload.password, user.password);
  if (!matched) throw new AppError(httpStatus.FORBIDDEN, "Password does not match!");

  const jwtPayload = {
    id: user._id,
    employeeId: user.employeeId,
    email: user.email,
    role: roleMapping[user.role],
    status: user.status,
  };

  // ✅ ensure you use the correct config keys for expirations & secrets
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret_token as string,
    (config as any).jwt_access_expires_time ?? config.jwt_refresh_expires_time
  );

  const refreshToken = createToken(
    jwtPayload,
    (config as any).jwt_refresh_secret_token ?? config.jwt_refresh_secret_token,
    (config as any).jwt_refresh_expires_time ?? config.jwt_refresh_expires_time
  );

  return { accessToken, refreshToken };
};

const logout = async (res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
    });
    return res.status(200).json({ message: "Successfully logged out." });
  } catch {
    return res.status(500).json({ message: "Failed to log out." });
  }
};

const changePassword = async (userInfo: JwtPayload, payload: TPasswordChange) => {
  const { oldPassword, newPassword } = payload;

  // ✅ your token sets { id, email }, not userId/userEmail
  const user = await User.isUserExistsByEmail(userInfo.email);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User does not exists!");
  if (user.isDeleted) throw new AppError(httpStatus.FORBIDDEN, "User is deleted!");
  if (user.status === "blocked") throw new AppError(httpStatus.FORBIDDEN, "User is Blocked!");

  const ok = await User.isPasswordMatched(oldPassword, user.password);
  if (!ok) throw new AppError(httpStatus.FORBIDDEN, "Old password does not match!");

  // set a new password (plain), pre-save hook will hash because it's modified
  const newHashed = await User.hashPassword(newPassword);
  await User.findOneAndUpdate(
    { _id: userInfo.id, role: userInfo.role },
    { password: newHashed, passwordChangedAt: new Date() }
  );

  return null;
};

export const AuthServices = { loginUser, changePassword, logout };
