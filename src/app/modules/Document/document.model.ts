import { model, Schema } from "mongoose";
import { DocumentModel, TDocument } from "./document.interface";

const documentSchema = new Schema<TDocument, DocumentModel>({
    documentName: {
        type: String,
        required: [true, 'Document name is required!'],
    },
    description: {
        type: String,
        required: [true, 'Document details are required!'],
    },
    documentFile: {
        type: [String],
        required: [true, 'Document file paths or URLs are required!'],
    },
    uploaderId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Uploader ID is required!'],
        ref: 'User',
    },
    uploadDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Upload date is required!'],
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
        required: [true, 'Last updated date is required!'],
    },
    tags: {
        type: [String],
        enum: ["hr", "finance", "legal", "admin"],
        default: [],
    },
    accessLevel: {
        type: String,
        enum: ['public', 'restricted', 'private'],
        default: 'private',
    },
    comments: {
        type: [String],
        default: [],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Define the Mongoose model
export const Document = model<TDocument, DocumentModel>('Document', documentSchema);