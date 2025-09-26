import { Model, Types } from "mongoose";

// TypeScript type for a Document
export type TDocument = {
    documentName: string;
    description: string;
    documentFile: string[];
    uploaderId?: Types.ObjectId;
    uploadDate: Date;
    lastUpdated: Date;
    tags?: ("hr" | "finance" | "legal" | "admin")[];
    accessLevel?: 'public' | 'restricted' | 'private';
    comments?: string[];
    isDeleted: boolean;
};

// Mongoose model interface for a Document
export interface DocumentModel extends Model<TDocument> {
    isDocumentDeleted(id: Types.ObjectId): Promise<TDocument>;
    findByUploaderId(uploaderId: Types.ObjectId): Promise<TDocument[]>;
    findByAccessLevel(accessLevel: 'public' | 'restricted' | 'private'): Promise<TDocument[]>;
}