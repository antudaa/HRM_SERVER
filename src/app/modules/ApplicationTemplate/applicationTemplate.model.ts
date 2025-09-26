import { Schema, model, Types } from "mongoose";
import { ApplicationTemplateModel, TApplicationTemplate } from "./applicationTemplate.interface";

const TemplateApproverSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
    role: { type: String },
    commentsRequired: { type: Boolean, default: false },
    dueAfterDays: { type: Number },
  },
  { _id: false }
);

const ApplicationTemplateSchema = new Schema<TApplicationTemplate, ApplicationTemplateModel>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization" },
    name: { type: String, required: true },
    code: { type: String, index: true, unique: false },
    applicationType: {
      type: String,
      enum: ["leave", "adjustment", "business_trip", "business_trip_report", "refund", "resignation", "home_office", "data_update"],
      required: true,
      index: true,
    },
    titleTemplate: { type: String },
    bodyTemplate: { type: String, required: true },
    variables: [{ type: String }],
    defaultApprovers: { type: [TemplateApproverSchema], default: [] },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ApplicationTemplateSchema.index({ orgId: 1, applicationType: 1, active: 1 });
ApplicationTemplateSchema.index({ orgId: 1, code: 1 }, { unique: false });

ApplicationTemplateSchema.statics.getActiveByType = function (orgId: Types.ObjectId | undefined, applicationType: TApplicationTemplate["applicationType"]) {
  const q: any = { applicationType, active: true };
  if (orgId) q.orgId = orgId;
  return this.find(q).sort({ createdAt: -1 });
};

export const ApplicationTemplate = model<TApplicationTemplate, ApplicationTemplateModel>("ApplicationTemplate", ApplicationTemplateSchema);
