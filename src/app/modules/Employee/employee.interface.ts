import { Model, Types } from "mongoose";
import { BloodGroup, Gender, JobType, LeaveTypeName, MaritalStatus, PerformanceRating, TName, WorkMode } from "./constant";

export type TWorkShift = {
    startingDate: globalThis.Date;
    endDate: globalThis.Date;
    duration: number;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
};

export type TCompanyDetails = {
    employeeId: string;
    department: {
        id: Types.ObjectId;
        departmentEmpId: string;
    };
    designation: {
        id: Types.ObjectId;
        designationEmpId: string;
    };
    fingerprintAttendanceId: string;
    dateOfJoining: globalThis.Date;
    resignationDate: globalThis.Date;
    workShifts: Types.ObjectId;
    runningWorkShift: string;
    isProbationaryPeriod: boolean;
    jobType: JobType;
    workMode: WorkMode;
};

export type TLeaveType = {
    leaveTypeName: LeaveTypeName;
    initialNumberOfLeave: number;
    remainingLeave: number;
    consumedLeave: number;
    earnedLeave: number;
    isEncashable: boolean;
};

export type TBankDetials = {
    accountName?: string;
    accountNumber?: number;
    bankName?: string;
    branchLocation?: string;
    bankIFSCCode?: string;
    taxPayerIdPAN?: String;
};

export type TExperiance = {
    companyName: string;
    monthOfExperience: number;
    noc: string;
};

export type TUploadFiles = {
    resume: string;
    idProof: string;
    offerLetter: string;
    agreementLetter?: string;
    noc?: string;
    experienceDetails?: TExperiance[];
};

export type TPersonalDetails = {
    name: TName;
    fatherName: string;
    motherName: string;
    contactNumber: string;
    emergencyContact?: string;
    dateOfBirth: globalThis.Date;
    gender: Gender;
    maritalStatus: MaritalStatus;
    bloodGroup: BloodGroup;
    officialEmail: string;
    personalEmail: string;
    presentAddress: string;
    permanentAddress: string;
    profileImage: string;
    signature: string;
};

export type TPerformanceReview = {
    evaluationDate: globalThis.Date;
    evaluatorId: Types.ObjectId;
    performanceRating: PerformanceRating;
    keyAchievements: string[];
    areasOfImprovement: string[];
    overallFeedback: string;
    goalsSetForNextPeriod?: string[];
    trainingRecommended?: boolean;
    trainingDetails?: string;
    additionalNotes?: string;
    isAcknowledged: boolean;
    acknowledgedBy?: Types.ObjectId;
};

export type TEmployeePerformance = {
    performanceReviews: TPerformanceReview[];
    averagePerformanceScore: number;
};

export type TEmployee = {
    personalInfo: TPersonalDetails;
    companyDetails: TCompanyDetails;
    leaveTypes: TLeaveType[];
    bankDetails: TBankDetials;
    uploadFiles: TUploadFiles;
    performance: TEmployeePerformance;
    isDeleted: boolean;
};

export interface EmployeeModel extends Model<TEmployee> {

    isEmployeeExistsByEmployeeID(empId: string): Promise<TEmployee | null>;

    isEmployeeDeleted(id: Types.ObjectId): Promise<boolean>;

    findEmployeeByEmail(email: string): Promise<TEmployee | null>;

    updatePersonalDetails(
        employeeId: Types.ObjectId,
        personalDetails: Partial<TPersonalDetails>
    ): Promise<TEmployee | null>;

    updateCompanyDetails(
        employeeId: Types.ObjectId,
        companyDetails: Partial<TCompanyDetails>
    ): Promise<TEmployee | null>;

    addOrUpdateWorkShift(
        employeeId: Types.ObjectId,
        workShift: TWorkShift
    ): Promise<TEmployee | null>;

    getEmployeesByFilter(
        filters: Partial<TCompanyDetails>
    ): Promise<TEmployee[]>;

    softDeleteEmployee(employeeId: Types.ObjectId): Promise<boolean>;

    restoreEmployee(employeeId: Types.ObjectId): Promise<TEmployee | null>;

    manageLeaveType(
        employeeId: Types.ObjectId,
        leaveType: TLeaveType
    ): Promise<TEmployee | null>;

    addPerformanceReview(
        employeeId: Types.ObjectId,
        performanceReview: TPerformanceReview
    ): Promise<TEmployee | null>;

    updateAveragePerformanceScore(employeeId: Types.ObjectId): Promise<number>;

    getPerformanceReviews(
        employeeId: Types.ObjectId
    ): Promise<TPerformanceReview[]>;

    searchEmployeesByName(name: string): Promise<TEmployee[]>;

    bulkUpdateCompanyDetails(
        employeeIds: Types.ObjectId[],
        companyDetails: Partial<TCompanyDetails>
    ): Promise<number>;
}