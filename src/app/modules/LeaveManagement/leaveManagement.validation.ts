// import { z } from "zod";

// const leaveTypeValidationSchema = z.object({
//     leaveTypeName: z.string({
//         required_error: "Leave Type is required!",
//     }).min(1, "Leave type cannot be empty"),

//     initialNumberOfLeaves: z.number({
//         required_error: "Number of days is required!",
//     }).int().min(0, "Initial leave must be at least 0"),

//     carryForward: z.boolean().optional(),

//     description: z.string().optional(),

//     isPaid: z.boolean().optional(),

//     isEncashable: z.boolean().optional(),

//     applicableFor: z.enum(["male", "female", "all"]).optional(),

//     isDeleted: z.boolean({
//         required_error: "Deleted status is required",
//         invalid_type_error: "Deleted status must be a boolean",
//     }).default(false),
// });

// export const LeaveTypeValidation = {
//     leaveTypeValidationSchema,
// };
