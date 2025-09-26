import { Model, Types } from "mongoose";
import { BloodGroup, Gender, JobType, MaritalStatus, PerformanceRating, TName, WorkMode } from "./constant";

/** Reference-only: we keep shift ids, details live in WorkShift collection */
export type TCompanyDetails = {
  employeeId?: string;
  department: {
    id: Types.ObjectId;
    departmentEmpId?: string;
  };
  designation: {
    id: Types.ObjectId;
    designationEmpId?: string;
  };
  officialEmail: string;
  fingerprintAttendanceId?: string;
  dateOfJoining: Date;
  resignationDate?: Date | "currentlyworking";
  workShifts?: Types.ObjectId[];
  runningWorkShift: Types.ObjectId;
  isProbationaryPeriod: boolean;
  jobType: JobType;
  workMode: WorkMode;
  employmentStatus?: "active" | "on_leave" | "terminated" | "resigned";
  managerId?: Types.ObjectId;
  locationId?: Types.ObjectId;
};

export type TBankDetials = {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchLocation?: string;
  bankIFSCCode?: string;
  taxPayerIdPAN?: string;
};

export type TUploadFiles = {
  resume?: string;
  idProof?: string;
  offerLetter?: string;
  agreementLetter?: string;
  noc?: string;
};

export type TPersonalDetails = {
  name: TName;
  fatherName: string;
  motherName: string;
  contactNumber: string;
  emergencyContact?: string;
  dateOfBirth: Date;
  gender: Gender;
  maritalStatus: MaritalStatus;
  bloodGroup: BloodGroup;
  personalEmail: string;
  presentAddress: string;
  permanentAddress: string;
  profileImage?: string;
  signature?: string;
  nationalIdNumber?: string;
};

export type TPerformanceReview = {
  evaluationDate: Date;
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
  _id?: Types.ObjectId;
  orgId?: Types.ObjectId;
  personalInfo: TPersonalDetails;
  companyDetails: TCompanyDetails;
  bankDetails: TBankDetials;
  uploadFiles: TUploadFiles;
  performance: TEmployeePerformance;
  timezone?: string;
  notes?: string;
  isDeleted: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
};

export interface EmployeeModel extends Model<TEmployee> {
  /** Existence check by employeeCode (human-readable) */
  existsByEmployeeCode(employeeCode: string): Promise<boolean>;

  /** Fetch by employeeCode */
  findByEmployeeCode(employeeCode: string): Promise<TEmployee | null>;

  /** Soft-delete checker */
  isEmployeeDeleted(id: Types.ObjectId): Promise<boolean>;

  /** Fetch by device fingerprint attendance id */
  findByAttendanceId(attendanceId: string): Promise<TEmployee | null>;

  /** Lookup by official/personal email */
  findEmployeeByEmail(email: string): Promise<TEmployee | null>;

  /** Patch personal details */
  updatePersonalDetails(
    employeeId: Types.ObjectId,
    personalDetails: Partial<TPersonalDetails>
  ): Promise<TEmployee | null>;

  /** Patch company details */
  updateCompanyDetails(
    employeeId: Types.ObjectId,
    companyDetails: Partial<TCompanyDetails>
  ): Promise<TEmployee | null>;

  /** Replace running work shift id and optionally push to history */
  setRunningWorkShift(
    employeeId: Types.ObjectId,
    workShiftId: Types.ObjectId,
    pushToHistory?: boolean
  ): Promise<TEmployee | null>;

  /** Filter by company details (consider adding pagination in service) */
  getEmployeesByFilter(
    filters: Partial<TCompanyDetails>
  ): Promise<TEmployee[]>;

  /** Soft delete (flag) */
  softDeleteEmployee(employeeId: Types.ObjectId): Promise<boolean>;

  /** Restore soft-deleted employee */
  restoreEmployee(employeeId: Types.ObjectId): Promise<TEmployee | null>;

  /** Add a new performance review entry */
  addPerformanceReview(
    employeeId: Types.ObjectId,
    performanceReview: TPerformanceReview
  ): Promise<TEmployee | null>;

  /** Recalculate & persist average score from reviews */
  updateAveragePerformanceScore(employeeId: Types.ObjectId): Promise<number>;

  /** Fetch all performance reviews */
  getPerformanceReviews(employeeId: Types.ObjectId): Promise<TPerformanceReview[]>;

  /** Case-insensitive search by name */
  searchEmployeesByName(name: string): Promise<TEmployee[]>;

  /** Bulk patch company details */
  bulkUpdateCompanyDetails(
    employeeIds: Types.ObjectId[],
    companyDetails: Partial<TCompanyDetails>
  ): Promise<number>;
}
