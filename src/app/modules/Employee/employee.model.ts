import { model, Schema, Model, Types } from "mongoose";
import {
  EmployeeModel,
  TBankDetials,
  TCompanyDetails,
  TEmployee,
  TPersonalDetails,
  TUploadFiles,
  TPerformanceReview,
  TEmployeePerformance,
} from "./employee.interface";
import {
  BloodGroup,
  Gender,
  JobType,
  MaritalStatus,
  PerformanceRating,
  WorkMode,
} from "./constant";

/* ----------------------------- Sub Schemas ----------------------------- */

const personalDetailsSchema = new Schema<TPersonalDetails>(
  {
    name: {
      firstName: { type: String, required: [true, "First Name is required"] },
      lastName: { type: String, required: [true, "Last Name is required"] },
      fullName: { type: String, required: [true, "Full Name is required"] },
    },
    fatherName: { type: String, required: [true, "Father's name is required"] },
    motherName: { type: String, required: [true, "Mother's name is required"] },
    contactNumber: { type: String, required: [true, "Contact number is required"] },
    emergencyContact: { type: String },
    dateOfBirth: { type: Date, required: [true, "Date of Birth is required"] },
    gender: { type: String, enum: Object.values(Gender), required: true },
    maritalStatus: { type: String, enum: Object.values(MaritalStatus), required: true },
    bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true },
    personalEmail: { type: String, required: [true, "Personal email is required"] },
    presentAddress: { type: String, required: [true, "Present address is required"] },
    permanentAddress: { type: String, required: [true, "Permanent address is required"] },
    profileImage: { type: String },
    signature: { type: String },
  },
  { _id: false }
);

const companyDetailsSchema = new Schema<TCompanyDetails>(
  {
    // ⚠️ removed unique/sparse/index here; we’ll define indexes centrally below
    employeeId: { type: String },

    department: {
      id: { type: Schema.Types.ObjectId, ref: "Department", required: true },
      departmentEmpId: { type: String },
    },
    designation: {
      id: { type: Schema.Types.ObjectId, ref: "Designation", required: true },
      designationEmpId: { type: String },
    },
    officialEmail: {
      type: String,
      required: [true, "Official email is required"],
      trim: true,
      lowercase: true,
    },
    fingerprintAttendanceId: { type: String },

    dateOfJoining: { type: Date, required: [true, "Date of joining is required"] },
    resignationDate: {
      type: Schema.Types.Mixed,
      validate: {
        validator: (v: unknown) =>
          v === "currentlyworking" || v instanceof Date || v === undefined,
        message: "resignationDate must be a Date or 'currentlyworking'",
      },
    },

    workShifts: [{ type: Schema.Types.ObjectId, ref: "WorkShift" }],
    runningWorkShift: {
      type: Schema.Types.ObjectId,
      ref: "WorkShift",
      required: [true, "Running work shift is required"],
    },
    isProbationaryPeriod: { type: Boolean, required: true },
    jobType: { type: String, enum: Object.values(JobType), required: true },
    workMode: { type: String, enum: Object.values(WorkMode), required: true },
  },
  { _id: false }
);

export const bankDetailsSchema = new Schema<TBankDetials>(
  {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchLocation: String,
    bankIFSCCode: String,
    taxPayerIdPAN: String,
  },
  { _id: false }
);

const uploadFileSchema = new Schema<TUploadFiles>(
  {
    resume: String,
    idProof: String,
    offerLetter: String,
    agreementLetter: String,
    noc: String,
  },
  { _id: false }
);

const performanceReviewSchema = new Schema<TPerformanceReview>(
  {
    evaluationDate: { type: Date },
    evaluatorId: { type: Schema.Types.ObjectId, ref: "Employee" },
    performanceRating: { type: String, enum: Object.values(PerformanceRating), required: true },
    keyAchievements: [String],
    areasOfImprovement: [String],
    overallFeedback: String,
    goalsSetForNextPeriod: [String],
    trainingRecommended: Boolean,
    trainingDetails: String,
    additionalNotes: String,
    isAcknowledged: { type: Boolean, required: true },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: "Employee" },
  },
  { _id: false }
);

const employeePerformanceSchema = new Schema<TEmployeePerformance>(
  {
    performanceReviews: [performanceReviewSchema],
    averagePerformanceScore: { type: Number, required: true },
  },
  { _id: false }
);

/* -------------------------------- Schema -------------------------------- */

const employeeSchema = new Schema<TEmployee, EmployeeModel>(
  {
    personalInfo: { type: personalDetailsSchema, required: true },
    companyDetails: { type: companyDetailsSchema, required: true },
    bankDetails: { type: bankDetailsSchema, required: true },
    uploadFiles: { type: uploadFileSchema, required: true },
    performance: { type: employeePerformanceSchema, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ------------------------------- Indexes -------------------------------- */
/** Centralized index definitions (no field-level index/unique above) */
employeeSchema.index({ "companyDetails.employeeId": 1 }, { unique: true, sparse: true, name: "uniq_emp_employeeId" });
employeeSchema.index({ "companyDetails.fingerprintAttendanceId": 1 }, { unique: true, sparse: true, name: "uniq_emp_fingerprintId" });
employeeSchema.index({ "companyDetails.officialEmail": 1 }, { unique: true, sparse: true, name: "uniq_emp_officialEmail" });
employeeSchema.index({ "companyDetails.department.id": 1 }, { name: "idx_emp_departmentId" });
employeeSchema.index({ "companyDetails.designation.id": 1 }, { name: "idx_emp_designationId" });
employeeSchema.index(
  { "personalInfo.name.fullName": "text", "personalInfo.name.firstName": "text", "personalInfo.name.lastName": "text" },
  { name: "emp_name_text" }
);

/* ------------------------------- Pre-save -------------------------------- */

employeeSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const EmployeeModel = this.constructor as Model<TEmployee>;
  const cd = this.companyDetails;
  if (!cd) return next(new Error("companyDetails is missing"));

  if (!cd.employeeId) {
    const count = await EmployeeModel.countDocuments({});
    cd.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
  }

  if (!cd.fingerprintAttendanceId) {
    const count = await EmployeeModel.countDocuments({});
    cd.fingerprintAttendanceId = String(count + 1).padStart(2, "0");
  }

  const Department = (await import("../Department/department.model")).Department;
  const Designation = (await import("../Designation/designation.model")).Designation;

  const dept = await Department.findById(cd.department.id);
  const desig = await Designation.findById(cd.designation.id);
  if (!dept || !desig) return next(new Error("Invalid department or designation reference"));

  if (!cd.department.departmentEmpId) {
    const deptCount = await EmployeeModel.countDocuments({ "companyDetails.department.id": cd.department.id });
    cd.department.departmentEmpId = `${dept.departmentId}${String(deptCount + 1).padStart(3, "0")}`;
  }

  if (!cd.designation.designationEmpId) {
    const desigCount = await EmployeeModel.countDocuments({ "companyDetails.designation.id": cd.designation.id });
    cd.designation.designationEmpId = `${desig.designationId}${String(desigCount + 1).padStart(3, "0")}`;
  }

  if (cd.runningWorkShift) {
    cd.workShifts = cd.workShifts || [];
    if (!cd.workShifts.map(String).includes(String(cd.runningWorkShift))) {
      cd.workShifts.push(cd.runningWorkShift);
    }
  }

  next();
});

/* -------------------------------- Statics ------------------------------- */

employeeSchema.statics.isEmployeeExistsByEmployeeId = async function (empId: string): Promise<TEmployee | null> {
  return this.findOne({ "companyDetails.employeeId": empId });
};

employeeSchema.statics.isEmployeeDeleted = async function (id: Types.ObjectId): Promise<boolean> {
  const doc = await this.findById(id).select({ isDeleted: 1 });
  return !!doc?.isDeleted;
};

employeeSchema.statics.isEmployeeExistsByAttendanceId = async function (attendanceId: string): Promise<TEmployee | null> {
  return this.findOne({ "companyDetails.fingerprintAttendanceId": attendanceId });
};

employeeSchema.statics.findEmployeeByEmail = async function (email: string): Promise<TEmployee | null> {
  return this.findOne({ "companyDetails.officialEmail": email.toLowerCase() });
};

employeeSchema.statics.updatePersonalDetails = async function (
  employeeId: Types.ObjectId,
  personalDetails: Partial<TPersonalDetails>
): Promise<TEmployee | null> {
  const $set: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(personalDetails)) {
    $set[`personalInfo.${k}`] = v;
  }
  return this.findByIdAndUpdate(employeeId, { $set }, { new: true });
};

employeeSchema.statics.updateCompanyDetails = async function (
  employeeId: Types.ObjectId,
  companyDetails: Partial<TCompanyDetails>
): Promise<TEmployee | null> {
  const $set: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(companyDetails)) {
    $set[`companyDetails.${k}`] = v;
  }
  return this.findByIdAndUpdate(employeeId, { $set }, { new: true });
};

employeeSchema.statics.addOrUpdateWorkShift = async function (
  employeeId: Types.ObjectId,
  workShiftId: Types.ObjectId
): Promise<TEmployee | null> {
  return this.findByIdAndUpdate(
    employeeId,
    {
      $set: { "companyDetails.runningWorkShift": workShiftId },
      $addToSet: { "companyDetails.workShifts": workShiftId },
    },
    { new: true }
  );
};

employeeSchema.statics.getEmployeesByFilter = async function (filters: Partial<TCompanyDetails>): Promise<TEmployee[]> {
  const q: Record<string, unknown> = {};
  if (filters.employeeId) q["companyDetails.employeeId"] = filters.employeeId;
  if (filters.department?.id) q["companyDetails.department.id"] = filters.department.id;
  if (filters.designation?.id) q["companyDetails.designation.id"] = filters.designation.id;
  if (typeof filters.isProbationaryPeriod === "boolean") q["companyDetails.isProbationaryPeriod"] = filters.isProbationaryPeriod;
  if (filters.jobType) q["companyDetails.jobType"] = filters.jobType;
  if (filters.workMode) q["companyDetails.workMode"] = filters.workMode;
  if (filters.runningWorkShift) q["companyDetails.runningWorkShift"] = filters.runningWorkShift;
  if (filters.fingerprintAttendanceId) q["companyDetails.fingerprintAttendanceId"] = filters.fingerprintAttendanceId;
  if (filters.officialEmail) q["companyDetails.officialEmail"] = filters.officialEmail.toLowerCase();

  return this.find(q);
};

employeeSchema.statics.softDeleteEmployee = async function (employeeId: Types.ObjectId): Promise<boolean> {
  const updated = await this.findByIdAndUpdate(employeeId, { $set: { isDeleted: true } }, { new: true });
  return !!updated;
};

employeeSchema.statics.restoreEmployee = async function (employeeId: Types.ObjectId): Promise<TEmployee | null> {
  return this.findByIdAndUpdate(employeeId, { $set: { isDeleted: false } }, { new: true });
};

employeeSchema.statics.addPerformanceReview = async function (
  employeeId: Types.ObjectId,
  performanceReview: TPerformanceReview
): Promise<TEmployee | null> {
  return this.findByIdAndUpdate(
    employeeId,
    { $push: { "performance.performanceReviews": performanceReview } },
    { new: true }
  );
};

employeeSchema.statics.updateAveragePerformanceScore = async function (employeeId: Types.ObjectId): Promise<number> {
  const employee = await this.findById(employeeId).select({ "performance.performanceReviews.performanceRating": 1 });
  if (!employee) return 0;

  const reviews = employee.performance?.performanceReviews ?? [];
  if (reviews.length === 0) {
    await this.findByIdAndUpdate(employeeId, { $set: { "performance.averagePerformanceScore": 0 } });
    return 0;
  }

  const ratingToScore: Record<string, number> = {
    Excellent: 5,
    "Very Good": 4,
    Good: 3,
    Average: 2,
    Poor: 1,
  };

  const total = reviews.reduce((sum, r) => sum + (ratingToScore[r.performanceRating] ?? 0), 0);
  const avg = total / reviews.length;

  await this.findByIdAndUpdate(employeeId, { $set: { "performance.averagePerformanceScore": avg } });
  return avg;
};

employeeSchema.statics.getPerformanceReviews = async function (employeeId: Types.ObjectId) {
  const employee = await this.findById(employeeId).select({ "performance.performanceReviews": 1 });
  return employee?.performance?.performanceReviews ?? [];
};

employeeSchema.statics.searchEmployeesByName = async function (name: string) {
  const regex = new RegExp(name, "i");
  return this.find({
    $or: [
      { "personalInfo.name.firstName": regex },
      { "personalInfo.name.lastName": regex },
      { "personalInfo.name.fullName": regex },
    ],
  });
};

employeeSchema.statics.bulkUpdateCompanyDetails = async function (
  employeeIds: Types.ObjectId[],
  companyDetails: Partial<TCompanyDetails>
): Promise<number> {
  const $set = Object.fromEntries(Object.entries(companyDetails).map(([k, v]) => [`companyDetails.${k}`, v]));
  const res = await this.updateMany({ _id: { $in: employeeIds } }, { $set });
  // @ts-ignore mongoose version differences
  return res.modifiedCount ?? res.nModified ?? 0;
};

export const Employee = model<TEmployee, EmployeeModel>("Employee", employeeSchema);
