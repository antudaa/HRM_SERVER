// import { Types } from "mongoose";
// import { z } from "zod";

// // Define the Zod schema for TLeaveInfo
// export const leaveInfoSchema = z.object({
//     leaveType: z.string().refine((val) => Types.ObjectId.isValid(val), {
//         message: "Invalid leave type ID!",
//     }),
//     leaveCategory: z.enum(['halfday', 'fullday'], {
//         errorMap: () => ({ message: 'Leave category must be either "halfday" or "fullday".' })
//     }),
//     dateOfApplication: z.date({
//         required_error: "Date of application is required!",
//     }),
//     leaveDates: z.date({
//         required_error: "Leave dates are required!",
//     }),
//     numberOfDays: z.number({
//         required_error: "Number of days is required!",
//     }),
//     fromDate: z.date({
//         required_error: "From date is required!",
//     }),
//     toDate: z.date({
//         required_error: "To date is required!",
//     }),
// });

// export const approverInfoSchema = z.object({
//     approverId: z.string().refine((val) => Types.ObjectId.isValid(val), {
//         message: "Invalid approver ID!",
//     }),
//     approveStatus: z.enum(['approved', 'pending', 'rejected'], {
//         errorMap: () => ({ message: 'Approve status must be either "approved", "pending", or "rejected".' })
//     }),
//     rejectionReason: z.string().optional(),
// });

// export const leaveApplicationSchema = z.object({
//     applicantInfo: z.string().refine((val) => Types.ObjectId.isValid(val), {
//         message: "Invalid applicant info ID!",
//     }),
//     applicationSubject: z.string({
//         required_error: "Application subject is required!",
//     }),
//     leaveTo: z.enum(['earn', 'get'], {
//         errorMap: () => ({ message: 'Leave to must be either "earn" or "get".' })
//     }),
//     applicationDetails: z.string({
//         required_error: "Application details are required!",
//     }),
//     applicationApprovalStatus: z.enum(['approved', 'pending', 'rejected'], {
//         errorMap: () => ({ message: 'Application approval status must be either "approved", "pending", or "rejected".' })
//     }),
//     leaveInfo: leaveInfoSchema,
//     approverList: z.array(approverInfoSchema),
//     isDeleted: z.boolean().optional(),
// });

// export const LeaveApplicationValidationSchema = {
//     leaveApplicationSchema,
// }