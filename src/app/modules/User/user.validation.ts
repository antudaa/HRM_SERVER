import { z } from "zod";

const userSchema = z.object({
    password: z.string({
        required_error: 'Password is required!',
        invalid_type_error: 'Password must be a string!',
    }).min(8, { message: 'Password must be at least 8 characters long!' }).max(24, {
        message: 'Password must be at most 24 characters long!'
    }).optional(),
    email: z.string({
        required_error: 'Email is required!',
        invalid_type_error: 'Email must be a string!',
    }).email({
        message: 'Invalid email address!'
    }),
});

export const UserValidation = {
    userSchema,
}