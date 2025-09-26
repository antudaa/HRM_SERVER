import { NextFunction, Response, Request } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import sendResponse from "../utils/sendResponse";
import AppError from "../Errors/AppError";
import catchAsync from "../utils/catchAsync";
import { TUserRole } from "../modules/User/user.interface";
import { User } from "../modules/User/user.model";
import { USER_ROLE } from "../modules/Employee/constant";

// const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.header("Authorization")?.replace("Bearer ", "");

//     // checking if the token is missing
//     if (!token) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.UNAUTHORIZED,
//             message: "Authorization token missing",
//         });
//     }

//     try {
//         // checking if the given token is valid
//         const decoded = jwt.verify(
//             token,
//             config.jwt_access_secret_token as string,
//         ) as JwtPayload;

//         // Attach user id and role to request object
//         (req as any).userId = decoded.userId;
//         (req as any).role = decoded.role;
//         next();
//     } catch (error) {
//         console.log(error);
//         sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.FORBIDDEN,
//             message: "Invalid token!",
//         });
//     }
// };


const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Authorization token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret_token as string
    ) as JwtPayload;

    // Keep your current fields
    (req as any).userId = decoded.userId;
    (req as any).role = decoded.role;

    // ✅ Add a normalized req.user that controllers can rely on
    (req as any).user = {
      _id: decoded.userId || decoded.id,              // prefer userId, fallback id
      id: decoded.userId || decoded.id,
      role: decoded.role,
      email: (decoded as any).email || (decoded as any).userEmail,
    };

    next();
  } catch (error) {
    console.log(error);
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.FORBIDDEN,
      message: "Invalid token!",
    });
  }
};

// Middleware for authorize SuperAdmin
const authorizeSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(
        token as string,
        config.jwt_access_secret_token as string,
    ) as JwtPayload;

    const user = await User.isUserExistsByEmail(decoded.email);

    if (!user || decoded?.role?.toLowerCase() !== USER_ROLE.SuperAdmin.toLowerCase()) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "You have no access to this route",
        });
    } else {
        next();
    }
};

// Middleware for authorize Admin
const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(
        token as string,
        config.jwt_access_secret_token as string,
    ) as JwtPayload;

    if (decoded?.role !== USER_ROLE.Admin) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "You have no access to this route",
        });
    } else {
        next();
    }
};

// Middleware for authorize Users
const authorizeEmployee = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(
        token as string,
        config.jwt_access_secret_token as string,
    ) as JwtPayload;

    if (decoded?.role !== USER_ROLE.Employee) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "You have no access to this route",
        });
    } else {
        next();
    }
};

// Function to verify jwt token
const getUserIdFromToken = (req: Request) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(
        token as string,
        config.jwt_access_secret_token as string,
    ) as JwtPayload;
    return decoded.userId;
};

const auth = (...requiredRoles: TUserRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        // checking if the token is missing
        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
        }

        // checking if the given token is valid
        const decoded = jwt.verify(
            token,
            config.jwt_access_secret_token as string,
        ) as JwtPayload;

        const { role, userId, userEmail, iat } = decoded;

        // checking if the user is exist
        const user = await User.isUserExistsByEmail(userEmail);

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
        }

        const isDeleted = user?.isDeleted;

        if (isDeleted) {
            throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
        }

        const userStatus = user?.status;

        if (userStatus === 'blocked') {
            throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
        }

        if (
            user.passwordChangedAt &&
            await User.isJWTIssuedBeforePasswordChanged(
                user.passwordChangedAt,
                iat as number,
            )
        ) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
        }

        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                'You are not authorized!',
            );
        }

        req.user = decoded as JwtPayload & { role: string };
        next();
    });
};

const extractUserIdFromRequest = (req: Request): string => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log(token);

    if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Authorization token is missing");
    }

    try {
        const decoded = jwt.verify(
            token,
            config.jwt_access_secret_token as string
        ) as JwtPayload;
        console.log(decoded);

        if (!decoded?.id) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload: userId missing");
        }

        return decoded.id;
    } catch (error) {
        throw new AppError(httpStatus.FORBIDDEN, "Invalid or expired token");
    }
};

export {
    auth,
    authenticateUser,
    authorizeSuperAdmin,
    authorizeAdmin,
    authorizeEmployee,
    getUserIdFromToken,
    extractUserIdFromRequest,
};