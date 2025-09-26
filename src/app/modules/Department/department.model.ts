import { model, Schema, Types } from "mongoose";
import { DepartmentModel, TDepartment } from "./department.interface";

const departmentSchema = new Schema<TDepartment, DepartmentModel>(
    {
        departmentName: {
            type: String,
            required: [true, 'Department name is required!'],
            unique: true,
        },
        departmentId: {
            type: String,
            required: [true, 'Department Id is required!'],
            unique: true,
        },
        designations: {
            type: [Schema.Types.ObjectId],
            ref: "Designation",
            default: [],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

departmentSchema.statics.isDepartmentDeleted = async function (id: Types.ObjectId) {
    return await this.findById(id);
};

export const Department = model<TDepartment, DepartmentModel>('Department', departmentSchema);