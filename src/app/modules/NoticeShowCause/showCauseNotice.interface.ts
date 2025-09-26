import { Types, Model } from "mongoose";

export type TShowCauseNotice = {
    noticeTitle: string;
    description: string;
    publishDate: globalThis.Date;
    noticeEventDate?: globalThis.Date;
    noticeCategory: 'individual' | 'department' | 'all';
    noticeFor: Types.ObjectId;
    noticeType: 'general' | 'event' | 'reminder' | 'warning';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    attachments?: string[];
    createdBy: Types.ObjectId;
    acknowledgedBy?: Types.ObjectId[];
    expirationDate?: globalThis.Date;
    isDeleted: boolean;
    isActive: boolean;
};

export type TEmployeeResponse = {
    noticeId: Types.ObjectId;
    employeeId: Types.ObjectId;
    responseDate: globalThis.Date;
    responseText: string;
    supportingDocuments?: string[];
    resolutionStatus: 'pending' | 'resolved' | 'unresolved';
    feedbackGiven?: string;
};

export type TEmployeeChat = {
    noticeId: Types.ObjectId;
    senderId: Types.ObjectId;
    message: string;
    sentDate: globalThis.Date;
};

export type TShowCauseProcess = {
    showCauseNotice: TShowCauseNotice;
    employeeResponse?: TEmployeeResponse;
    employeeChats?: TEmployeeChat[];
};

export interface ShowCauseProcessModel extends Model<TShowCauseProcess> {
    isNoticeExpired(noticeEventDate: globalThis.Date): Promise<boolean>;
    isNoticeDeleted(id: Types.ObjectId): Promise<boolean>;
    markAsAcknowledged(id: Types.ObjectId, userId: Types.ObjectId): Promise<void>;
    addAttachment(id: Types.ObjectId, attachmentUrl: string): Promise<void>;
    getResponseByNoticeId(noticeId: Types.ObjectId): Promise<TEmployeeResponse | null>;
    updateResponseStatus(noticeId: Types.ObjectId, status: 'resolved' | 'unresolved', feedback?: string): Promise<void>;
    getChatsByNoticeId(noticeId: Types.ObjectId): Promise<TEmployeeChat[]>;
    addChatMessage(noticeId: Types.ObjectId, senderId: Types.ObjectId, message: string): Promise<TEmployeeChat>;
}