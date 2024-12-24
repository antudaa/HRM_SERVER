import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import { TActivityStatus, USER_ROLE } from "../Employee/constant";

const userSchema = new Schema<TUser>(
    {
        id: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        needsPasswordChange: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            enum: USER_ROLE,
        },
        status: {
            type: String,
            enum: TActivityStatus,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true
    },
);

userSchema.pre('save', async function (next) {
    const user = this;

    user.password = await bcrypt.hash(
        user.password,
        Number(config.bcrypt_salt_rounds),
    );
    next();
});

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    },
});

userSchema.statics.hashPassword = async function (password: string) {
    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds),
    );
    return hashedPassword;
};

userSchema.statics.blockUserByID = async function (id: Schema.Types.ObjectId) {
    return await User.findByIdAndUpdate(
        id,
        { status: 'blocked' },
        { new: true },
    );
};

userSchema.statics.softDeleteUser = async function (id: Schema.Types.ObjectId) {
    return await User.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
    );
};

userSchema.statics.deleteUserByID = async function (id: Schema.Types.ObjectId) {
    return await User.findByIdAndDelete(id);
};

userSchema.statics.isUserBlocked = async function (id: Schema.Types.ObjectId) {
    const user = await this.findById(id);
    return user && user.status === 'blocked';
};

userSchema.statics.isUserExistedByID = async function (id: Schema.Types.ObjectId) {
    return await this.findById(id);
}

userSchema.statics.isUserExistsByEmail = async function (email: string) {
    return await this.findOne({ email }).select('_id').lean();
};

userSchema.statics.isUserDeleted = async function (id: Schema.Types.ObjectId) {
    const user = await this.findOne({ _id: id }).select('isDeleted').lean();
    return user && user.isDeleted === true;
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = async function (
    passwordChangeTimeStamp: Date, jwtIssuedTimeStamp: number
) {
    const passwordChangeTime = new Date(passwordChangeTimeStamp).getTime() / 1000;

    return passwordChangeTime > jwtIssuedTimeStamp;
}

userSchema.statics.isPasswordMatched = async function (
    plainPassword,
    hashedPassword,
) {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const User = model<TUser>('User', userSchema)

