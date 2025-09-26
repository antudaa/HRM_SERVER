import { z } from "zod";
import { Types } from "mongoose";

// Helper schema for ObjectId validation
const ObjectIdSchema = z.custom<Types.ObjectId>((val) => Types.ObjectId.isValid(val as any), {
    message: "Invalid ObjectId",
});

// Zod schema for ShowCauseNotice
const ShowCauseNoticeSchema = z.object({
    noticeTitle: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    publishDate: z.date(),
    noticeEventDate: z.date().optional(),
    noticeCategory: z.enum(["individual", "department", "all"]),
    noticeFor: ObjectIdSchema,
    noticeType: z.enum(["general", "event", "reminder", "warning"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    attachments: z.array(z.string()).optional(),
    createdBy: ObjectIdSchema,
    acknowledgedBy: z.array(ObjectIdSchema).optional(),
    expirationDate: z.date().optional(),
    isDeleted: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

// Zod schema for EmployeeResponse
const EmployeeResponseSchema = z.object({
    noticeId: ObjectIdSchema,
    employeeId: ObjectIdSchema,
    responseDate: z.date(),
    responseText: z.string().min(1, "Response text is required"),
    supportingDocuments: z.array(z.string()).optional(),
    resolutionStatus: z.enum(["pending", "resolved", "unresolved"]),
    feedbackGiven: z.string().optional(),
});

// Zod schema for EmployeeChat
const EmployeeChatSchema = z.object({
    noticeId: ObjectIdSchema,
    senderId: ObjectIdSchema,
    message: z.string().min(1, "Message is required"),
    sentDate: z.date(),
});

// Zod schema for the main ShowCauseProcess
const ShowCauseProcessSchema = z.object({
    showCauseNotice: ShowCauseNoticeSchema,
    employeeResponse: EmployeeResponseSchema.optional(),
    employeeChats: z.array(EmployeeChatSchema).optional(),
});

// Example of how to validate an object using this schema
const dataToValidate = {
    showCauseNotice: {
        noticeTitle: "Notice Title",
        description: "Notice description",
        publishDate: new Date(),
        noticeCategory: "individual",
        noticeFor: new Types.ObjectId(),
        noticeType: "general",
        priority: "high",
        createdBy: new Types.ObjectId(),
    },
};

const validationResult = ShowCauseProcessSchema.safeParse(dataToValidate);

if (!validationResult.success) {
    console.error(validationResult.error);
} else {
    console.log("Validation succeeded:", validationResult.data);
};

export {
    ShowCauseNoticeSchema,
    EmployeeResponseSchema,
    EmployeeChatSchema,
    ShowCauseProcessSchema,
};
