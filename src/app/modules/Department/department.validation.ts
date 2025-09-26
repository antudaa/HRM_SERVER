import { z } from "zod";

// Zod Schema for TDepartment
export const departmentZodSchema = z.object({
    departmentName: z.string({
        required_error: 'Department name is required!',
        invalid_type_error: 'Department name must be a string',
    }).min(1, 'Department name cannot be empty'),
    departmentId: z.string({
        required_error: 'Department ID is required!',
        invalid_type_error: 'Department ID must be a string',
    }).min(1, 'Department ID cannot be empty'),
    designations: z.array(z.string()).optional(),
    isDeleted: z.boolean().default(false),
});

export const updateDepartmentZodSchema = departmentZodSchema.partial();