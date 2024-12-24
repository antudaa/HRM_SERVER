import { Model, Types } from "mongoose";
import { TActivityStatus, USER_ROLE } from "../Employee/constant";

export type TUser = {
    id: Types.ObjectId;
    password: string;
    email: string;
    needsPasswordChange: boolean;
    role: USER_ROLE;
    status: TActivityStatus;
    isDeleted: boolean;
};

export interface UserModel extends Model<TUser> {

    hashPassword(password: string): Promise<string>;

    blockUserByID(id: Types.ObjectId): Promise<Types.ObjectId>;

    softDeleteUser(id: Types.ObjectId): Promise<Types.ObjectId>;

    deleteUserByID(id: Types.ObjectId): Promise<Types.ObjectId>;

    isUserBlocked(id: Types.ObjectId): Promise<Types.ObjectId>;

    isUserExistedByID(id: Types.ObjectId): Promise<Types.ObjectId>;

    isUserExistsByEmail(email: string): Promise<string>;

    isUserDeleted(id: Types.ObjectId): Promise<Types.ObjectId>;

    isJWTIssuedBeforePasswordChanged(passwordChangeTimeStamp: Date, jwtIssuedTimeStamp: number): Promise<Boolean>;

    isPasswordMatched(plainPassword: string, hashedPassword: string): Promise<Boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;