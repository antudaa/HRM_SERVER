import jwt from "jsonwebtoken";
import { TUserRole } from "../User/user.interface";
import { Types } from "mongoose";

export const createToken = (
    jwtPayload: {
        id: Types.ObjectId,
        employeeId: Types.ObjectId,
        email: string;
        role: TUserRole;
        status: string,
    },
    secret: string,
    expiresIn: string,
) => {
    return jwt.sign(jwtPayload, secret, {
        expiresIn,
    });
};