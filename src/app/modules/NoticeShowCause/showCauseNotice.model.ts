import { Schema, model, Types } from "mongoose";
import { ShowCauseProcessModel, TShowCauseProcess } from "./showCauseNotice.interface";

// Schema for showCauseNotice
const ShowCauseNoticeSchema = new Schema({
    noticeTitle: { type: String, required: true },
    description: { type: String, required: true },
    publishDate: { type: Date, required: true },
    noticeEventDate: { type: Date },
    noticeCategory: { type: String, enum: ['individual', 'department', 'all'], required: true },
    noticeFor: { type: Types.ObjectId, required: true },
    noticeType: { type: String, enum: ['general', 'event', 'reminder', 'warning'], required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
    attachments: [{ type: String }],
    createdBy: { type: Types.ObjectId, required: true },
    acknowledgedBy: [{ type: Types.ObjectId }],
    expirationDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}); 

// Schema for employeeResponse
const EmployeeResponseSchema = new Schema({
    noticeId: { type: Types.ObjectId, required: true },
    employeeId: { type: Types.ObjectId, required: true },
    responseDate: { type: Date, required: true },
    responseText: { type: String, required: true },
    supportingDocuments: [{ type: String }],
    resolutionStatus: { type: String, enum: ['pending', 'resolved', 'unresolved'], required: true },
    feedbackGiven: { type: String },
});

// Schema for employeeChats
const EmployeeChatSchema = new Schema({
    noticeId: { type: Types.ObjectId, required: true },
    senderId: { type: Types.ObjectId, required: true },
    message: { type: String, required: true },
    sentDate: { type: Date, required: true },
});


// Main schema for ShowCauseProcess
const ShowCauseProcessSchema = new Schema<TShowCauseProcess>({
    showCauseNotice: { type: ShowCauseNoticeSchema, required: true },
    employeeResponse: { type: EmployeeResponseSchema },
    employeeChats: { type: [EmployeeChatSchema] },
});

// Static methods for the schema
ShowCauseProcessSchema.statics.isNoticeExpired = async function (noticeEventDate: globalThis.Date): Promise<boolean> {
    return noticeEventDate < new Date();
};

ShowCauseProcessSchema.statics.isNoticeDeleted = async function (id: Types.ObjectId): Promise<boolean> {
    const notice = await this.findById(id);
    return notice?.showCauseNotice.isDeleted ?? false;
};

ShowCauseProcessSchema.statics.markAsAcknowledged = async function (id: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    await this.updateOne({ _id: id }, { $addToSet: { "showCauseNotice.acknowledgedBy": userId } });
};

ShowCauseProcessSchema.statics.addAttachment = async function (id: Types.ObjectId, attachmentUrl: string): Promise<void> {
    await this.updateOne({ _id: id }, { $push: { "showCauseNotice.attachments": attachmentUrl } });
};

ShowCauseProcessSchema.statics.getResponseByNoticeId = async function (noticeId: Types.ObjectId): Promise<TShowCauseProcess['employeeResponse'] | null> {
    return this.findOne({ "showCauseNotice._id": noticeId }, { employeeResponse: 1 });
};

ShowCauseProcessSchema.statics.updateResponseStatus = async function (noticeId: Types.ObjectId, status: 'resolved' | 'unresolved', feedback?: string): Promise<void> {
    await this.updateOne({ "showCauseNotice._id": noticeId }, { $set: { "employeeResponse.resolutionStatus": status, "employeeResponse.feedbackGiven": feedback } });
};

ShowCauseProcessSchema.statics.getChatsByNoticeId = async function (noticeId: Types.ObjectId): Promise<TShowCauseProcess['employeeChats'] | null> {
    return this.findOne({ "showCauseNotice._id": noticeId }, { employeeChats: 1 });
};

ShowCauseProcessSchema.statics.addChatMessage = async function (noticeId: Types.ObjectId, senderId: Types.ObjectId, message: string): Promise<void> {
    await this.updateOne({ "showCauseNotice._id": noticeId }, { $push: { employeeChats: { senderId, message, sentDate: new Date() } } });
};

// Export the model
export const ShowCauseProcess = model<TShowCauseProcess, ShowCauseProcessModel>("ShowCauseProcess", ShowCauseProcessSchema);
