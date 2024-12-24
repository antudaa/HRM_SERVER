import mongoose, { Types } from "mongoose";
import { TActivityStatus, USER_ROLE } from "../Employee/constant";
import { TEmployee } from "../Employee/employee.interface";
import { Employee } from "../Employee/employee.model";
import { TUser } from "./user.interface";
import { Admin } from "../Admin/admin.model";
import AppError from "../../Errors/AppError";
import httpStatus from "http-status";
import { User } from "./user.model";

const createAdminIntoDB = async (employeeData: TEmployee, userPassword: string) => {
    const userData: Partial<TUser> = {}
    userData.password = userPassword;
    userData.role = USER_ROLE.Admin;
    userData.email = employeeData.personalInfo.officialEmail;
    userData.status = TActivityStatus.Active;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const admin = await Admin.create([employeeData], { session });

        if (!admin.length) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Admin!');
        }

        userData.id = new Types.ObjectId(admin[0]?._id);

        const newUser = await User.create([userData], { session });

        if (!newUser.length) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create User!');
        }

        await session.commitTransaction();
        await session.endSession();
        return admin;
    } catch (err: any) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error(err);
    }
};

export const UserServices = {
    createAdminIntoDB,
}; 