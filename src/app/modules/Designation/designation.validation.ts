import { z } from "zod";
import { Types } from "mongoose";

// Zod Schema for TDesignation
export const designationSchema = z.object({
    designationName: z.string()
        .min(1, 'Designation name is required!')
        .max(100, 'Designation name must not exceed 100 characters'),
    designationId: z.string()
        .min(1, 'Designation ID is required!')
        .max(100, 'Designation ID must not exceed 100 characters'),
    department: z.instanceof(Types.ObjectId, {
        message: 'Department ID must be a valid ObjectId',
    }),
    isDeleted: z.boolean({
        required_error: 'Deleted status is required',
        invalid_type_error: 'Deleted status must be a boolean',
    }).default(false),
});

export const updateDesignationValidation = designationSchema.partial();