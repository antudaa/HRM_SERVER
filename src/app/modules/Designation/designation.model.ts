import { model, Schema } from "mongoose";
import { DesignationModel, TDesignation } from "./designation.interface";

const designationSchema = new Schema<TDesignation, DesignationModel>(
    {
        designationName: {
            type: String,
            required: [true, 'Designation name is required!'],
            unique: true,
        },
        designationId: {
            type: String,
            required: [true, 'Designation id is required!'],
            unique: true,
        },
        department: {
            type: Schema.Types.ObjectId,
            required: [true, 'Department id is required!'],
            ref: 'Department'
        },
        isDeleted: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    },
);

export const Designation = model<TDesignation, DesignationModel>('Designation', designationSchema);