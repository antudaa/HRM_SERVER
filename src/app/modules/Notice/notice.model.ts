import { Schema, Types, model } from "mongoose";
import { TGeneralNotice, NoticeModel } from "./notice.interface";

const noticeSchema = new Schema<TGeneralNotice, NoticeModel>(
  {
    noticeTitle: {
      type: String,
      required: [true, "Notice title is required!"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
      trim: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,   // server sets current time
      immutable: true,     // never updated after creation
      validate: {
        validator: function (v: Date) {
          return v <= new Date();
        },
        message: "Publish date cannot be in the future!",
      },
    },
    noticeEventDate: {
      type: Date,
    },
    noticeCategory: {
      type: String,
      enum: {
        values: ["department", "all"],
        message: "Invalid notice category! Valid options: department, all.",
      },
      required: [true, "Notice category is required!"],
    },
    noticeFor: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      validate: {
        validator: function (this: TGeneralNotice) {
          if (this.noticeCategory === "department") {
            return !!this.noticeFor; // must be present
          }
          return true; // not needed when category is 'all'
        },
        message:
          "noticeFor (Department ID) is required when category is 'department'.",
      },
    },
    noticeType: {
      type: String,
      enum: {
        values: ["general", "event", "reminder", "warning"],
        message:
          "Invalid notice type! Valid options are: general, event, reminder, warning.",
      },
      required: [true, "Notice type is required!"],
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message:
          "Invalid priority level! Valid options are: low, medium, high, urgent.",
      },
      required: [true, "Priority level is required!"],
    },
    attachments: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required!"],
    },
    acknowledgedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expirationDate: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false, // ✅ added to match services
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Static methods remain the same
noticeSchema.statics.isNoticeExpired = async function (
  noticeEventDate: globalThis.Date
): Promise<boolean> {
  return new Date() > noticeEventDate;
};

noticeSchema.statics.isNoticeDeleted = async function (
  id: Types.ObjectId
): Promise<boolean> {
  const notice = await this.findById(id);
  return notice?.isDeleted || false;
};

noticeSchema.statics.markAsAcknowledged = async function (
  id: Types.ObjectId,
  userId: Types.ObjectId
): Promise<void> {
  await this.updateOne({ _id: id }, { $addToSet: { acknowledgedBy: userId } });
};

export const Notice = model<TGeneralNotice, NoticeModel>("Notice", noticeSchema);
