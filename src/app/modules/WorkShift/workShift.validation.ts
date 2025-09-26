import { z } from "zod";

// Regex: YYYY-MMM-ShiftName (e.g., 2025-Jul-Night)
const shiftNameRegex = /^\d{4}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)to(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-[A-Za-z0-9\s\-]{3,30}$/;

export const workShiftValidationSchema = z.object({
    shiftName: z
        .string()
        .regex(
            shiftNameRegex,
            "Shift name must follow the format: YYYY-MMM-ShiftName (e.g., 2025-Jul-Night)"
        ),
    shiftType: z.enum(["fullday", "halfday", "custom"], {
        required_error: "Shift type is required",
        invalid_type_error: "Shift type must be either 'fullday' or 'halfday' or 'custom'",
    }),
    shiftStarts: z
        .string({
            required_error: "Shift start time is required",
        })
        .min(1, "Shift start time cannot be empty"),
    shiftEnds: z
        .string({
            required_error: "Shift end time is required",
        })
        .min(1, "Shift end time cannot be empty"),
    shiftStartsDate: z
        .date({
            required_error: "Shift start date is required",
        }),
    shiftEndsDate: z
        .date({
            required_error: "Shift end date is required",
        }),
    workingHour: z.number().optional(),
    shiftYear: z
        .number()
        .optional(),

    isDeleted: z.boolean().default(false),
});

export const WorkShiftValidation = {
    workShiftValidationSchema,
};
