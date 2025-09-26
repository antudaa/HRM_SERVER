import { Model, Types } from "mongoose";

export type TTemplateApprover = {
  employeeId?: Types.ObjectId;
  role?: string;
  commentsRequired?: boolean;
  dueAfterDays?: number;
};

export type TApplicationTemplate = {
  orgId?: Types.ObjectId;
  name: string;
  code?: string;
  applicationType:
  | "leave"
  | "adjustment"
  | "business_trip"
  | "business_trip_report"
  | "refund"
  | "resignation"
  | "home_office"
  | "data_update";

  titleTemplate?: string;
  bodyTemplate: string;
  variables?: string[];

  defaultApprovers?: TTemplateApprover[];
  active: boolean;

  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface ApplicationTemplateModel extends Model<TApplicationTemplate> {
  getActiveByType(orgId: Types.ObjectId | undefined, applicationType: TApplicationTemplate["applicationType"]): Promise<TApplicationTemplate[]>;
}
