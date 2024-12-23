import { Model, Types } from "mongoose";

export const USER_ROLE = {
    supseradmin: 'superadmin',
    admin: 'admin',
    employee: 'employee',
    hr: 'hr',
    manager: 'manager',
}

export type TUser = {
    id: string;
    password: string;
    email: string;
    needsPasswordChange: boolean;
    role: 'admin' | 'superadmin' | 'employee' | 'hr' | 'manager';
    status: 'active' | 'blocked' | 'archieved';
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