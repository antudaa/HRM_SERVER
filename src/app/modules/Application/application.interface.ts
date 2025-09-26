import { Model, Types } from "mongoose";

export type ApplicationKind =
    | "leave"
    | "adjustment"
    | "business_trip"
    | "business_trip_report"
    | "refund"
    | "resignation"
    | "home_office"
    | "data_update";

export type ApplicationStatus = "draft" | "in_review" | "pending" | "approved" | "rejected" | "cancelled";
export type ApprovalStageStatus = "pending" | "approved" | "rejected" | "commented" | "skipped";
export type ApplicationPriority = "low" | "normal" | "high" | "urgent";

/* --------- Common: comments & approvals --------- */
export type TCommentThread = {
    _id?: Types.ObjectId;
    senderId: Types.ObjectId;
    role: "applicant" | "approver";
    message: string;
    createdAt: Date;
    attachments?: string[];
    replyTo?: Types.ObjectId;
    resolved?: boolean;
};

export type TApprovalStage = {
    approverId: Types.ObjectId;
    status: ApprovalStageStatus;
    commentThread: TCommentThread[];
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    delegatedTo?: Types.ObjectId;
    escalatedTo?: Types.ObjectId;
    commentsRequired?: boolean;
    dueAt?: Date;
};

export type TApplicationStatusTimeline = {
    status: "created" | "submitted" | "forwarded" | "commented" | "approved" | "rejected" | "cancelled" | "restored";
    changedBy: Types.ObjectId;
    changedAt: Date;
    message?: string;
};

export type TApplicantSnapshot = {
    employeeId: Types.ObjectId;
    name?: string;
    departmentId?: Types.ObjectId;
    designationId?: Types.ObjectId;
};

/* --------- Per-type details --------- */
export type TLeaveApplicationDetails = {
    leaveMode: "single" | "multiple" | "halfday";
    leaveTypeId: Types.ObjectId;
    halfDaySession?: "morning" | "afternoon";
    adjustmentReason?: string;
    adjustedDate?: Date;
    expectedDeliveryDate?: Date;
    childBirthDate?: Date;
    effectiveDates?: Date[];
};

export type TAdjustmentDetails = {
    mode: "earn" | "spend";
    days: number;
    forDate?: Date;
    reason?: string;
};

export type TBusinessTripDetails = {
    purpose: string;
    destinations: { city: string; country?: string }[];
    itinerary?: { date: Date; note?: string }[];
    needAdvance?: boolean;
    estimatedCost?: number;
    costBreakdown?: { label: string; amount: number }[];
};

export type TBusinessTripReportDetails = {
    tripRefId?: Types.ObjectId;
    summary: string;
    actualCost?: number;
    receipts?: string[];
    breakdown?: { label: string; amount: number }[];
};

export type TRefundDetails = {
    items: { label: string; amount: number }[];
    total: number;
    reason?: string;
    receipts?: string[];
};

export type THomeOfficeDetails = {
    dates: Date[];
    reason?: string;
};

export type TResignationDetails = {
    noticeDays?: number;
    lastWorkingDay: Date;
    reason?: string;
};

export type TDataUpdateDetails = {
    fields: { path: string; oldValue?: unknown; newValue: unknown; reason?: string }[];
};

/* --------- Main Application --------- */
export type TGeneralApplication = {
    orgId?: Types.ObjectId;
    applicationType: ApplicationKind;

    applicantId: Types.ObjectId;
    applicantSnapshot?: TApplicantSnapshot;

    applicationNo?: string;
    title?: string;
    numberOfDays: number;
    fromDate: Date;
    toDate: Date;
    reason: string;
    body: string;

    attachments?: string[];
    relatedApplicationId?: Types.ObjectId;
    remarks?: string;

    approvers: TApprovalStage[];
    currentApproverIndex: number;
    currentStatus: ApplicationStatus;
    priority?: ApplicationPriority;
    slaDueAt?: Date;
    finalDecisionDate?: Date;

    ccWatchers?: Types.ObjectId[];
    visibility?: "private" | "department" | "org";

    isCancelled?: boolean;
    cancelledBy?: Types.ObjectId;
    cancelledAt?: Date;
    cancelReason?: string;

    history: { status: TApplicationStatusTimeline["status"]; actorId: Types.ObjectId; timestamp: Date; message?: string }[];
    applicationStatusTimeline: TApplicationStatusTimeline[];

    // Per-type
    leaveDetails?: TLeaveApplicationDetails;
    adjustmentDetails?: TAdjustmentDetails;
    businessTripDetails?: TBusinessTripDetails;
    businessTripReportDetails?: TBusinessTripReportDetails;
    refundDetails?: TRefundDetails;
    homeOfficeDetails?: THomeOfficeDetails;
    resignationDetails?: TResignationDetails;
    dataUpdateDetails?: TDataUpdateDetails;

    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};

/* --------- Search & Model --------- */
export type TApplicationSearchFilters = Partial<{
    orgId: Types.ObjectId;
    type: ApplicationKind;
    status: ApplicationStatus;
    priority: ApplicationPriority;
    from: Date;
    to: Date;
    applicantId: Types.ObjectId;
    approverId: Types.ObjectId;
    departmentId: Types.ObjectId;
    designationId: Types.ObjectId;
    text: string;
}>;

export type TPagination = { limit?: number; page?: number; sort?: Record<string, 1 | -1> };

export interface ApplicationModel extends Model<TGeneralApplication> {
    getActiveApplicationsByUser(userId: Types.ObjectId): Promise<TGeneralApplication[]>;
    getApplicationWithComments(appId: Types.ObjectId): Promise<TGeneralApplication | null>;
    isApplicationDeleted(appId: Types.ObjectId): Promise<boolean>;
    getPendingApprovalsForApprover(approverId: Types.ObjectId): Promise<TGeneralApplication[]>;
    search(filters?: TApplicationSearchFilters, paging?: TPagination): Promise<TGeneralApplication[]>;
    listPaged(filters?: TApplicationSearchFilters, paging?: TPagination): Promise<{ data: TGeneralApplication[]; total: number }>;
    addComment(appId: Types.ObjectId, stageIndex: number, comment: Omit<TCommentThread, "_id" | "createdAt"> & { createdAt?: Date }): Promise<TGeneralApplication | null>;
    advanceStage(appId: Types.ObjectId, approverId: Types.ObjectId, action: "approve" | "reject" | "comment", payload?: { message?: string; rejectionReason?: string }): Promise<TGeneralApplication | null>;
    cancelApplication(appId: Types.ObjectId, cancelledBy: Types.ObjectId, reason?: string): Promise<TGeneralApplication | null>;
}
