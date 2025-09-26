import { z } from "zod";
import { Types } from "mongoose";

// Define the Zod schema for the document
export const documentSchema = z.object({
    documentName: z.string({
        required_error: 'Document name is required',
        invalid_type_error: 'Document name must be a string',
    }),
    details: z.string({
        required_error: 'Document details are required',
        invalid_type_error: 'Document details must be a string',
    }),
    documentFile: z.array(z.string(), {
        required_error: 'Document file paths or URLs are required',
        invalid_type_error: 'Document file must be an array of strings',
    }),
    uploaderId: z.instanceof(Types.ObjectId, {
        message: 'Uploader ID is required',
    }),
    uploadDate: z.date({
        required_error: 'Upload date is required',
        invalid_type_error: 'Upload date must be a valid date',
    }),
    lastUpdated: z.date({
        required_error: 'Last updated date is required',
        invalid_type_error: 'Last updated date must be a valid date',
    }),
    tags: z.array(z.string()).optional(),
    accessLevel: z.enum(['public', 'restricted', 'private']).optional(),
    comments: z.array(z.string()).optional(),
    isDeleted: z.boolean({
        required_error: 'Deleted status is required',
        invalid_type_error: 'Deleted status must be a boolean',
    })
        .default(false),
});

export const DocumentValidation = {
    documentSchema,
};