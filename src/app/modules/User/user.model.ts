import { model, Schema } from "mongoose";
import { TUser, UserModel } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import { TActivityStatus, USER_ROLE } from "../Employee/constant";
import AppError from "../../Errors/AppError";
import httpStatus from "http-status";

const userSchema = new Schema<TUser>(
  {
    employeeId: { type: Schema.Types.ObjectId, required: true, ref: "Employee" },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    needsPasswordChange: { type: Boolean, default: true },
    role: { type: String, enum: USER_ROLE },
    status: { type: String, enum: TActivityStatus },
    superAdminId: { type: Schema.Types.ObjectId, ref: "SuperAdmin" },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Hash password ONLY if modified
userSchema.pre("save", async function (next) {
  const user = this as any;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
  next();
});

// Duplicate email -> friendly error
userSchema.post("save", function (error: any, _doc: any, next: any) {
  if (error?.name === "MongoServerError" && error?.code === 11000) {
    return next(new AppError(httpStatus.BAD_REQUEST, "Email already exists!"));
  }
  next(error);
});

// Hide password in JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Utilities
userSchema.statics.hashPassword = async function (password: string) {
  return bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
};

userSchema.statics.blockUserByID = async function (id: Schema.Types.ObjectId) {
  return await User.findByIdAndUpdate(id, { status: "blocked" }, { new: true });
};

userSchema.statics.softDeleteUser = async function (id: Schema.Types.ObjectId) {
  return await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

userSchema.statics.deleteUserByID = async function (id: Schema.Types.ObjectId) {
  return await User.findByIdAndDelete(id);
};

userSchema.statics.isUserBlocked = async function (id: Schema.Types.ObjectId) {
  const user = await this.findById(id);
  return user && user.status === "blocked";
};

userSchema.statics.isUserExistedByID = async function (id: Schema.Types.ObjectId) {
  return await this.findById(id);
};

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isUserDeleted = async function (email: string) {
  const user = await this.findOne({ email }).select("isDeleted").lean();
  return !!user && user.isDeleted === true;
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = async function (
  passwordChangeTimeStamp: Date,
  jwtIssuedTimeStamp: number
) {
  const passwordChangeTime = new Date(passwordChangeTimeStamp).getTime() / 1000;
  return passwordChangeTime > jwtIssuedTimeStamp;
};

userSchema.statics.isPasswordMatched = async function (
  plainPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const User = model<TUser, UserModel>("User", userSchema);
