import { Types, Model } from "mongoose";

export type TGeneralNotice = {
  noticeTitle: string;
  description: globalThis.String;
  publishDate: globalThis.Date;
  noticeEventDate?: globalThis.Date;
  noticeCategory: "department" | "all";
  noticeFor?: Types.ObjectId;
  noticeType: "general" | "event" | "reminder" | "warning";
  priority: "low" | "medium" | "high" | "urgent";
  attachments?: string[];
  createdBy: Types.ObjectId;
  acknowledgedBy?: Types.ObjectId[];
  expirationDate?: globalThis.Date;
  isArchived: boolean;        // ✅ add this
  isDeleted: boolean;
  isActive: boolean;
};

export interface NoticeModel extends Model<TGeneralNotice> {
  isNoticeExpired(noticeEventDate: globalThis.Date): Promise<boolean>;
  isNoticeDeleted(id: Types.ObjectId): Promise<boolean>;
  markAsAcknowledged(id: Types.ObjectId, userId: Types.ObjectId): Promise<void>;
}
