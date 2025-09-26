import { Model, Types } from "mongoose";
import { TActivityStatus, USER_ROLE } from "../Employee/constant";

export type TUser = {
    _id?: Types.ObjectId;
    employeeId: Types.ObjectId;
    password: string;
    email: string;
    needsPasswordChange: boolean;
    role: USER_ROLE;
    status: TActivityStatus;
    isDeleted: boolean;
    superAdminId?: Types.ObjectId;
    adminId?: Types.ObjectId;
    passwordChangedAt?: Date | null;
};

export interface UserModel extends Model<TUser> {
    hashPassword(password: string): Promise<string>;
    blockUserByID(id: Types.ObjectId): Promise<Types.ObjectId>;
    softDeleteUser(id: Types.ObjectId): Promise<Types.ObjectId>;
    deleteUserByID(id: Types.ObjectId): Promise<Types.ObjectId>;
    isUserBlocked(id: Types.ObjectId): Promise<Types.ObjectId>;
    isUserExistedByID(id: Types.ObjectId): Promise<Types.ObjectId>;
    isUserExistsByEmail(email: string): Promise<TUser>;
    isUserDeleted(id: string): Promise<Types.ObjectId>;
    isJWTIssuedBeforePasswordChanged(
        passwordChangeTimeStamp: Date,
        jwtIssuedTimeStamp: number
    ): Promise<boolean>;
    isPasswordMatched(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
