import { model, Schema, Types } from "mongoose";
import {
    EmployeeModel,
    TBankDetials,
    TCompanyDetails,
    TEmployee,
    TExperiance,
    TLeaveType,
    TPersonalDetails,
    TUploadFiles,
    TPerformanceReview,
    TEmployeePerformance,
} from "./employee.interface";
import { BloodGroup, Gender, JobType, MaritalStatus, PerformanceRating, WorkMode } from "./constant";

// Schema for TExperiance
const experienceSchema = new Schema<TExperiance>(
    {
        companyName: { type: String, required: [true, 'Company Name is required'] },
        monthOfExperience: { type: Number, required: [true, 'Month of Experience is required'] },
        noc: { type: String, required: false },
    },
    { _id: false, },
);

// Schema for TUploadFiles
export const uploadFileSchema = new Schema<TUploadFiles>(
    {
        resume: { type: String, required: [true, 'Resume is required'] },
        idProof: { type: String, required: [true, 'ID Proof is required'] },
        offerLetter: { type: String, required: [true, 'Offer Letter is required'] },
        agreementLetter: { type: String, required: false },
        noc: { type: String, required: false },
        experienceDetails: { type: [experienceSchema], required: [true, 'Experience Details are required'] },
    },
    { _id: false, },
);

// Schema for TPersonalDetils
export const personalDetailsSchema = new Schema<TPersonalDetails>(
    {
        name: {
            firstName: { type: String, required: [true, 'First Name is required!'] },
            lastName: { type: String, required: [true, 'Last Name is required!'] },
            fullName: { type: String, required: [true, 'Full Name is required!'] },
        },
        fatherName: { type: String, required: [true, 'Father\'s Name is required'] },
        motherName: { type: String, required: [true, 'Mother\'s Name is required'] },
        contactNumber: { type: String, required: [true, 'Contact Number is required'] },
        emergencyContact: { type: String, required: false },
        dateOfBirth: { type: Date, required: [true, 'Date of Birth is required'] },
        gender: { type: String, enum: Gender, required: [true, 'Gender is required'] },
        maritalStatus: { type: String, enum: MaritalStatus, required: [true, 'Marital Status is required'] },
        bloodGroup: { type: String, enum: BloodGroup, required: [true, 'Blood Group is required'] },
        officialEmail: { type: String, required: [true, 'Official Email is required'] },
        personalEmail: { type: String, required: [true, 'Personal Email is required'] },
        presentAddress: { type: String, required: [true, 'Present Address is required'] },
        permanentAddress: { type: String, required: [true, 'Permanent Address is required'] },
        profileImage: { type: String, required: [true, 'Profile Image is required'] },
        signature: { type: String, required: [true, 'Signature is required'] },
    },
    {
        _id: false,
    },
);

// Schema for TCompanyDetails
export const companyDetailsSchema = new Schema<TCompanyDetails>(
    {
        employeeId: { type: String, required: [true, 'Employee ID is required'], unique: true },
        department: {
            id: {
                type: Schema.Types.ObjectId,
                required: [true, 'Department ID is required'],
                ref: 'Department',
            },
            departmentEmpId: {
                type: String,
                required: [true, 'Department Employee ID is required'],
            }
        },
        designation: {
            id: {
                type: Schema.Types.ObjectId,
                required: [true, 'Designation ID is required'],
                ref: 'Designation',
            },
            designationEmpId: {
                type: String,
                required: [true, 'Designation Employee ID is required'],
            }
        },
        fingerprintAttendanceId: { type: String, required: [true, 'Attendance ID is required'], unique: true },
        dateOfJoining: { type: Date, required: [true, 'Date of Joining is required'] },
        resignationDate: { type: Date, required: false },
        workShifts: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'WorkShift'
        },
        runningWorkShift: { type: String, required: [true, 'Running Work Shift is required'] },
        isProbationaryPeriod: { type: Boolean, required: true },
        jobType: {
            type: String,
            enum: JobType,
            required: [true, 'Job Type is required'],
        },
        workMode: {
            type: String,
            enum: WorkMode,
            required: [true, 'Work Mode is required'],
        }
    },
    { _id: false, },
);

// Schema for TLeaveType
export const leaveTypeSchema = new Schema<TLeaveType>(
    {
        leaveTypeName: { type: String, required: [true, 'Leave Type Name is required'] },
        initialNumberOfLeave: { type: Number, required: [true, 'Number of Leaves is required'] },
        remainingLeave: { type: Number, required: false },
        consumedLeave: { type: Number, required: false },
        earnedLeave: { type: Number, required: false },
        isEncashable: { type: Boolean, required: false },
    },
    { _id: false, },
);

// Schema for TBankDetials
export const bankDetailsSchema = new Schema<TBankDetials>(
    {
        accountName: { type: String, required: false },
        accountNumber: { type: Number, required: false },
        bankName: { type: String, required: false },
        branchLocation: { type: String, required: false },
        bankIFSCCode: { type: String, required: false },
        taxPayerIdPAN: { type: String, required: false },
    },
    { _id: false, },
);

// Schema for TPerformanceReview
export const performanceReviewSchema = new Schema<TPerformanceReview>(
    {
        evaluationDate: { type: Date, required: [true, 'Evaluation Date is required'] },
        evaluatorId: { type: Schema.Types.ObjectId, required: [true, 'Evaluator ID is required'], ref: 'Employee' },
        performanceRating: {
            type: String,
            enum: PerformanceRating,
            required: [true, 'Performance Rating is required'],
        },
        keyAchievements: { type: [String], required: [true, 'Key Achievements are required'] },
        areasOfImprovement: { type: [String], required: [true, 'Areas of Improvement are required'] },
        overallFeedback: { type: String, required: [true, 'Overall Feedback is required'] },
        goalsSetForNextPeriod: { type: [String], required: false },
        trainingRecommended: { type: Boolean, required: false },
        trainingDetails: { type: String, required: false },
        additionalNotes: { type: String, required: false },
        isAcknowledged: { type: Boolean, required: [true, 'Acknowledgement Status is required'] },
        acknowledgedBy: { type: Schema.Types.ObjectId, required: false, ref: 'Employee' },
    },
    { _id: false },
);

// Schema for TEmployeePerformance
export const employeePerformanceSchema = new Schema<TEmployeePerformance>(
    {
        performanceReviews: { type: [performanceReviewSchema], required: false },
        averagePerformanceScore: { type: Number, required: [true, 'Average Performance Score is required'] },
    },
    { _id: false, },
);

// Schema for TEmployee
const employeeSchema = new Schema<TEmployee, EmployeeModel>(
    {
        personalInfo: { type: personalDetailsSchema, required: [true, 'Personal Information is required'] },
        companyDetails: { type: companyDetailsSchema, required: [true, 'Company Details are required'] },
        leaveTypes: { type: [leaveTypeSchema], required: [true, 'Leave Types are required'] },
        bankDetails: { type: bankDetailsSchema, required: [true, 'Bank Details are required'] },
        uploadFiles: { type: uploadFileSchema, required: [true, 'Uploaded Files are required'] },
        performance: { type: employeePerformanceSchema, required: [true, 'Employee Performance is required'] },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true },
);

employeeSchema.statics.isEmployeeExistsByEmployeeID = async function (empId: string) {
    const existingEmployee = await this.findOne({
        'companyDetails.employeeId': empId,
    });

    if (existingEmployee) {
        return existingEmployee;
    }
    return false;
};

employeeSchema.statics.isEmployeeDeleted = async function (id: Types.ObjectId) {
    const existingEmployee = await this.findById(id);

    if (existingEmployee?.isDeleted === true) {
        return true;
    }
    return false;
}

// Add static methods implementation
employeeSchema.statics.findEmployeeByEmail = async function (email) {
    return await this.findOne({ "personalInfo.officialEmail": email });
};

employeeSchema.statics.updatePersonalDetails = async function (employeeId, personalDetails) {
    return await this.findByIdAndUpdate(
        employeeId,
        { $set: { personalInfo: personalDetails } },
        { new: true }
    );
};

employeeSchema.statics.updateCompanyDetails = async function (employeeId, companyDetails) {
    return await this.findByIdAndUpdate(
        employeeId,
        { $set: { companyDetails } },
        { new: true }
    );
};

employeeSchema.statics.addOrUpdateWorkShift = async function (employeeId, workShift) {
    return await this.findByIdAndUpdate(
        employeeId,
        { $set: { "companyDetails.runningWorkShift": workShift } },
        { new: true }
    );
};

employeeSchema.statics.getEmployeesByFilter = async function (filters) {
    return await this.find({ "companyDetails": { $match: filters } });
};

employeeSchema.statics.softDeleteEmployee = async function (employeeId) {
    const result = await this.findByIdAndUpdate(
        employeeId,
        { $set: { isDeleted: true } },
        { new: true }
    );
    return !!result;
};

employeeSchema.statics.restoreEmployee = async function (employeeId) {
    return await this.findByIdAndUpdate(
        employeeId,
        { $set: { isDeleted: false } },
        { new: true }
    );
};

employeeSchema.statics.manageLeaveType = async function (employeeId, leaveType) {
    return await this.findByIdAndUpdate(
        employeeId,
        { $push: { leaveTypes: leaveType } },
        { new: true }
    );
};

employeeSchema.statics.addPerformanceReview = async function (employeeId, performanceReview) {
    return await this.findByIdAndUpdate(
        employeeId,
        { $push: { "performance.performanceReviews": performanceReview } },
        { new: true }
    );
};

employeeSchema.statics.updateAveragePerformanceScore = async function (employeeId) {
    const employee = await this.findById(employeeId);
    if (!employee) return 0;

    const reviews = employee.performance.performanceReviews;
    if (reviews.length === 0) return 0;

    const ratingToScore: Record<string, number> = {
        "Excellent": 5,
        "Very Good": 4,
        "Good": 3,
        "Average": 2,
        "Poor": 1
    };

    // Calculate total score
    const totalScore = reviews.reduce((sum: number, review) => {
        const score = ratingToScore[review.performanceRating] || 0;
        return sum + score;
    }, 0);

    // Calculate average score
    const averageScore = totalScore / reviews.length;

    // Update the average performance score in the database
    await this.findByIdAndUpdate(
        employeeId,
        { $set: { "performance.averagePerformanceScore": averageScore } },
        { new: true }
    );

    return averageScore;
};

employeeSchema.statics.getPerformanceReviews = async function (employeeId) {
    const employee = await this.findById(employeeId);
    return employee ? employee.performance.performanceReviews : [];
};

employeeSchema.statics.searchEmployeesByName = async function (name) {
    const regex = new RegExp(name, "i");
    return await this.find({
        $or: [
            { "personalInfo.name.firstName": regex },
            { "personalInfo.name.lastName": regex },
        ],
    });
};

employeeSchema.statics.bulkUpdateCompanyDetails = async function (employeeIds, companyDetails) {
    const result = await this.updateMany(
        { _id: { $in: employeeIds } },
        { $set: { companyDetails } }
    );
    return result.modifiedCount;
};

export const Employee = model<TEmployee, EmployeeModel>('Employee', employeeSchema);
