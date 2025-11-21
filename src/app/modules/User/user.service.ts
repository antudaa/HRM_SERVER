// services/user.service.ts
import mongoose, { Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "../../Errors/AppError";
import { User } from "./user.model";
import { TUser } from "./user.interface";
import { Employee } from "../Employee/employee.model";
import { TEmployee } from "../Employee/employee.interface";
import { Admin } from "../Admin/admin.model";
import { SuperAdmin } from "../SuperAdmin/superadmin.model";
import { TActivityStatus, USER_ROLE } from "../Employee/constant";

/* ----------------------------- Types ----------------------------- */
export type CreateSuperAdminPayload = {
  employee: TEmployee;
  privileges: {
    canCreateSuperAdmin: boolean;
    canCreateAdmins: boolean;
    canRemoveAdmins: boolean;
    canManageCompanySettings: boolean;
    canViewAllReports: boolean;
  };
  globalAccess: boolean;
};

export type CreateAdminPayload = {
  employee: TEmployee;
  adminPrivileges?: {
    canManageEmployees?: boolean;
    canAccessSensitiveData?: boolean;
    canModifyRoles?: boolean;
  };
  managedDepartments?: Types.ObjectId[];
};

/* ----------------------------- Helpers ----------------------------- */

const asObjectId = (id: string | Types.ObjectId) =>
  typeof id === "string" ? new Types.ObjectId(id) : id;

const ensureUniqueUserEmail = async (email?: string) => {
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Official email is required.");
  }
  const exists = await User.findOne({ email }).lean();
  if (exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User with email ${email} already exists.`
    );
  }
};

const buildEmployeeData = (payload: TEmployee): TEmployee => {
  if (!payload?.companyDetails?.officialEmail) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "companyDetails.officialEmail is required."
    );
  }
  if (!payload?.personalInfo?.name) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "personalInfo.name is required."
    );
  }

  const {
    personalInfo,
    companyDetails,
    bankDetails,
    uploadFiles,
    performance,
    orgId,
    timezone,
    notes,
  } = payload;

  return {
    orgId,
    personalInfo,
    companyDetails,
    bankDetails,
    uploadFiles,
    performance,
    timezone,
    notes,
    isDeleted: false,
  } as TEmployee;
};

/* ---------------------- Create Super Admin Flow --------------------- */

const createSuperAdminIntoDB = async (
  superAdminPayload: CreateSuperAdminPayload,
  userPassword: string
) => {
  if (!superAdminPayload || !userPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Super Admin data and password are required."
    );
  }

  const employeeData = buildEmployeeData(superAdminPayload.employee);
  await ensureUniqueUserEmail(employeeData.companyDetails?.officialEmail);

  const session = await mongoose.startSession();
  try {
    let result: { user: TUser; employee: TEmployee; superAdmin: any } | null =
      null;

    await session.withTransaction(async () => {
      const [employee] = await Employee.create([employeeData], { session });
      if (!employee)
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to create Employee.");

      const [superAdmin] = await SuperAdmin.create(
        [
          {
            employeeId: employee._id,
            superAdminPrivileges: superAdminPayload.privileges,
            globalAccess: !!superAdminPayload.globalAccess,
            isDeleted: false,
          },
        ],
        { session }
      );
      if (!superAdmin)
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Failed to create Super Admin."
        );

      // pass plain password; model pre-save hook will hash
      const [user] = await User.create(
        [
          {
            employeeId: employee._id,
            superAdminId: superAdmin._id,
            password: userPassword,
            role: USER_ROLE.SuperAdmin,
            email: employee.companyDetails.officialEmail,
            status: TActivityStatus.Active,
            needsPasswordChange: true,
            isDeleted: false,
          } as Partial<TUser>,
        ],
        { session }
      );
      if (!user)
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to create User.");

      result = {
        user: user.toObject(),
        employee: employee.toObject(),
        superAdmin: superAdmin.toObject(),
      };
    });

    return result!;
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Duplicate key error. Likely email already exists."
      );
    }
    throw err instanceof AppError
      ? err
      : new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        err.message || "Error creating super admin."
      );
  } finally {
    await session.endSession();
  }
};

/* ------------------------- Create Admin Flow ------------------------ */

const createAdminIntoDB = async (
  payload: CreateAdminPayload,
  userPassword: string
) => {
  if (!payload || !payload.employee || !userPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Admin data and password are required."
    );
  }

  const employeeData = buildEmployeeData(payload.employee);
  await ensureUniqueUserEmail(employeeData.companyDetails?.officialEmail);

  const session = await mongoose.startSession();
  try {
    let result: { user: TUser; employee: TEmployee; admin: any } | null = null;

    await session.withTransaction(async () => {
      const [employee] = await Employee.create([employeeData], { session });
      if (!employee)
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to create Employee.");

      const [admin] = await Admin.create(
        [
          {
            employeeId: employee._id,
            adminPrivileges: {
              canManageEmployees: false,
              canAccessSensitiveData: false,
              canModifyRoles: false,
              ...(payload.adminPrivileges || {}),
            },
            managedDepartments: payload.managedDepartments || [],
            isDeleted: false,
          },
        ],
        { session }
      );
      if (!admin)
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to create Admin.");

      // pass plain password; model pre-save hook will hash
      const [user] = await User.create(
        [
          {
            employeeId: employee._id,
            adminId: admin._id,
            password: userPassword,
            role: USER_ROLE.Admin,
            email: employee.companyDetails.officialEmail,
            status: TActivityStatus.Active,
            needsPasswordChange: true,
            isDeleted: false,
          } as Partial<TUser>,
        ],
        { session }
      );
      if (!user)
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to create User.");

      result = {
        user: user.toObject(),
        employee: employee.toObject(),
        admin: admin.toObject(),
      };
    });

    return result!;
  } catch (err: any) {
    if (err?.code === 11000)
      throw new AppError(httpStatus.CONFLICT, "Duplicate key error.");
    throw err instanceof AppError
      ? err
      : new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        err.message || "Error creating admin."
      );
  } finally {
    await session.endSession();
  }
};

/* ------------------------ Create Employee Flow ---------------------- */

const createEmployeeIntoDB = async (
  employeeDataRaw: TEmployee,
  userPassword: string
) => {
  if (!employeeDataRaw || !userPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Employee data and password are required."
    );
  }

  const employeeData = buildEmployeeData(employeeDataRaw);
  await ensureUniqueUserEmail(employeeData.companyDetails?.officialEmail);

  const session = await mongoose.startSession();
  try {
    let result: { user: TUser; employee: TEmployee } | null = null;

    await session.withTransaction(async () => {
      const [employee] = await Employee.create([employeeData], { session });
      if (!employee)
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to create Employee.");

      // pass plain password; model pre-save hook will hash
      const [user] = await User.create(
        [
          {
            employeeId: employee._id,
            password: userPassword,
            role: USER_ROLE.Employee,
            email: employee.companyDetails.officialEmail,
            status: TActivityStatus.Active,
            needsPasswordChange: true,
            isDeleted: false,
          } as Partial<TUser>,
        ],
        { session }
      );
      if (!user)
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to create User.");

      result = { user: user.toObject(), employee: employee.toObject() };
    });

    return result!;
  } catch (err: any) {
    if (err?.code === 11000)
      throw new AppError(httpStatus.CONFLICT, "Duplicate key error.");
    throw err instanceof AppError
      ? err
      : new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        err.message || "Error creating employee."
      );
  } finally {
    await session.endSession();
  }
};

/* ----------------------------- Queries / Deletes ----------------------------- */
// (unchanged from your version)

const getCurrentUser = async (userId: string | Types.ObjectId) => {
  const id = asObjectId(userId);
  const user = await User.findById(id)
    .populate({
      path: "employeeId",
      populate: [
        { path: "companyDetails.department.id", model: "Department" },
        { path: "companyDetails.designation.id", model: "Designation" },
      ],
    })
    .populate("superAdminId")
    .populate("adminId")
    .lean();

  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  if (user.isDeleted)
    throw new AppError(httpStatus.FORBIDDEN, "User is deleted.");
  if (user.status === TActivityStatus.Blocked) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked.");
  }
  return user;
};

const getAllUser = async () => {
  return User.find()
    .populate("employeeId")
    .populate({
      path: "employeeId",
      populate: [
        { path: "companyDetails.department.id", model: "Department" },
        { path: "companyDetails.designation.id", model: "Designation" },
      ],
    })
    .populate("superAdminId")
    .populate("adminId")
    .lean();
};

const getActiveUsers = async () => {
  return User.find({ status: TActivityStatus.Active })
    .populate({
      path: "employeeId",
      populate: [
        { path: "companyDetails.department.id", model: "Department" },
        { path: "companyDetails.designation.id", model: "Designation" },
      ],
    })
    .populate("superAdminId")
    .sort({ "employeeId.companyDetails.employeeId": 1 })
    .lean();
};

const getUserById = async (id: string) => {
  return User.findById(id)
    .populate("employeeId")
    .populate("superAdminId")
    .populate("adminId")
    .lean();
};

const softDeleteUser = async (id: string) => {
  return User.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
};

const deleteUser = async (id: string) => {
  const _id = asObjectId(id);
  const session = await mongoose.startSession();
  try {
    let deleted: any = null;
    await session.withTransaction(async () => {
      const user = await User.findById(_id).session(session);
      if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found.");

      await User.findByIdAndDelete(_id, { session });
      if (user.employeeId) {
        await Employee.findByIdAndDelete(user.employeeId, { session });
      }
      if (user.adminId) {
        await Admin.findByIdAndDelete(user.adminId, { session });
      }
      if (user.superAdminId) {
        await SuperAdmin.findByIdAndDelete(user.superAdminId, { session });
      }

      deleted = user.toObject();
    });
    return deleted;
  } catch (err: any) {
    throw err instanceof AppError
      ? err
      : new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        err.message || "Error deleting user."
      );
  } finally {
    await session.endSession();
  }
};

export const UserServices = {
  createSuperAdminIntoDB,
  createAdminIntoDB,
  createEmployeeIntoDB,
  getCurrentUser,
  getAllUser,
  getActiveUsers,
  getUserById,
  softDeleteUser,
  deleteUser,
};
