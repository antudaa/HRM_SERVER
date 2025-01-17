import { z } from "zod";
import { Types } from "mongoose";
import WorkShift from "../WorkShift/workShift.model";

// Zod Schema for TExperiance
export const experienceSchema = z.object({
    companyName: z.string({
        required_error: 'Company name is required',
        invalid_type_error: 'Company name must be a string',
    }),
    monthOfExperience: z.number({
        required_error: 'Month of experience is required',
        invalid_type_error: 'Month of experience must be a number',
    }),
});

// Zod Schema for TUploadFiles
export const uploadFileSchema = z.object({
    resume: z.string({
        required_error: 'Resume is required',
        invalid_type_error: 'Resume must be a string',
    }),
    idProof: z.string({
        required_error: 'ID proof is required',
        invalid_type_error: 'ID proof must be a string',
    }),
    offerLetter: z.string({
        required_error: 'Offer letter is required',
        invalid_type_error: 'Offer letter must be a string',
    }),
    agreementLetter: z.string().optional(),
    noc: z.string().optional(),
    experienceDetails: z.array(experienceSchema, {
        required_error: 'Experience details are required',
        invalid_type_error: 'Experience details must be an array',
    }),
});

// Zod Schema for TPersonalDetils
export const personalDetailsSchema = z.object({
    name: z.object({
        firstName: z.string({
            required_error: 'First name is required',
            invalid_type_error: 'First name must be a string',
        }),
        lastName: z.string({
            required_error: 'Last name is required',
            invalid_type_error: 'Last name must be a string',
        }),
    }),
    fatherName: z.string({
        required_error: 'Father name is required',
        invalid_type_error: 'Father name must be a string',
    }),
    motherName: z.string({
        required_error: 'Mother name is required',
        invalid_type_error: 'Mother name must be a string',
    }),
    contactNumber: z.string({
        required_error: 'Contact number is required',
        invalid_type_error: 'Contact number must be a string',
    }),
    emergencyContact: z.string().optional(),
    dateOfBirth: z.date({
        required_error: 'Date of birth is required',
        invalid_type_error: 'Date of birth must be a valid date',
    }),
    gender: z.enum(['male', 'female', 'other'], {
        required_error: 'Gender is required',
        invalid_type_error: 'Gender must be one of male, female, or other',
    }),
    maritalStatus: z.enum(['married', 'unmarried'], {
        required_error: 'Marital status is required',
        invalid_type_error: 'Marital status must be one of married or unmarried',
    }),
    bloodGroup: z.enum(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'], {
        required_error: 'Blood group is required',
        invalid_type_error: 'Blood group must be one of the specified types',
    }),
    officialEmail: z.string({
        required_error: 'Official email is required',
        invalid_type_error: 'Official email must be a string',
    }).email({ message: 'Invalid email address' }),
    personalEmail: z.string({
        required_error: 'Personal email is required',
        invalid_type_error: 'Personal email must be a string',
    }).email({ message: 'Invalid email address' }),
    presentAddress: z.string({
        required_error: 'Present address is required',
        invalid_type_error: 'Present address must be a string',
    }),
    permanentAddress: z.string({
        required_error: 'Permanent address is required',
        invalid_type_error: 'Permanent address must be a string',
    }),
    profileImage: z.string({
        required_error: 'Profile image is required',
        invalid_type_error: 'Profile image must be a string',
    }),
    signature: z.string({
        required_error: 'Signature is required',
        invalid_type_error: 'Signature must be a string',
    }),
});

// Zod Schema for TCompanyDetails
export const companyDetailsSchema = z.object({
    employeeId: z.string({
        required_error: 'Employee ID is required',
        invalid_type_error: 'Employee ID must be a string',
    }),
    fingerprintAttendanceId: z.string({
        required_error: "Fingerprint Attendance ID is required",
        invalid_type_error: "Fingerprint Attendance ID must be a string",
    }).default(""),
    department: z.object({
        department: z.string().refine(val => Types.ObjectId.isValid(val), {
            message: 'Department ID must be a valid ObjectId',
        }).transform(val => new Types.ObjectId(val)),
        departmentEmpId: z.string({
            required_error: 'Department Employee ID is required',
            invalid_type_error: 'Department Employee ID must be a string',
        }),
    }),
    designation: z.string().refine(val => Types.ObjectId.isValid(val), {
        message: 'Designation ID must be a valid ObjectId',
    }).transform(val => new Types.ObjectId(val)),
    dateOfJoining: z.date({
        required_error: 'Date of joining is required',
        invalid_type_error: 'Date of joining must be a valid date',
    }),
    resignationDate: z.date().optional(),
    workShift: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Work Shift ID must be a valid ObjectId",
    }).transform((val) => new Types.ObjectId(val)),
    runningWorkShift: z.string({
        required_error: 'Running work shift is required',
        invalid_type_error: 'Running work shift must be a string',
    }),
    isProbationaryPeriod: z.boolean().default(false),
    jobType: z.enum(['fullTime', 'partTime', 'contractual'], {
        required_error: 'Job type is required',
        invalid_type_error: 'Job type must be one of fullTime, partTime, or contractual',
    }),
    workMode: z.enum(['onsite', 'remote', 'hybrid'], {
        required_error: 'Work mode is required',
        invalid_type_error: 'Work mode must be one of onsite, remote, or hybrid',
    }),
});

// Zod Schema for TLeaveType
export const leaveTypeSchema = z.object({
    leaveTypeName: z.string({
        required_error: 'Leave type name is required',
        invalid_type_error: 'Leave type name must be a string',
    }),
    initialNumberOfLeave: z.number({
        required_error: 'Number of leaves is required',
        invalid_type_error: 'Number of leaves must be a number',
    }),
    remainingLeave: z.number({
        invalid_type_error: "Remaining leaves must be a number!",
    }).optional(),
    consumedLeave: z.number({
        invalid_type_error: "Consumed leave must be a number!",
    }).optional(),
    isEncashable: z.boolean({
        invalid_type_error: "Is encashable must be a boolean!",
    }).optional(),
});

// Zod Schema for TBankDetials
export const bankDetailsSchema = z.object({
    accountName: z.string().optional(),
    accountNumber: z.number().optional(),
    bankName: z.string().optional(),
    branchLocation: z.string().optional(),
    bankIFSCCode: z.string().optional(),
    taxPayerIdPAN: z.string().optional(),
});

// Zod Performance Schema
export const performanceReviewSchema = z.array(
    z.object({
        evaluationDate: z.date({
            invalid_type_error: 'Evaluation Date must be a valid date',
        }).optional().default(new Date('')), // Default to an empty date
        evaluatorId: z.string({
            invalid_type_error: 'Evaluator ID must be a string',
        }).optional().default(''),
        performanceRating: z.string({
            invalid_type_error: 'Performance Rating must be a string',
        }).optional().default(''),
        keyAchievements: z.string({
            invalid_type_error: 'Key Achievements must be a string',
        }).optional().default(''),
        areasOfImprovement: z.string().optional().default(''),
        overallFeedback: z.string({
            invalid_type_error: 'Overall Feedback must be a string',
        }).optional().default(''),
        goalsSetForNextPeriod: z.string({
            invalid_type_error: 'Goals Set for Next Period must be a string',
        }).optional().default(''),
        trainingRecommended: z.string({
            invalid_type_error: 'Training Recommended must be a string',
        }).optional().default(''),
        trainingDetails: z.string({
            invalid_type_error: 'Training Details must be a string',
        }).optional().default(''),
        additionalNotes: z.string({
            invalid_type_error: 'Additional Notes must be a string',
        }).optional().default(''),
        isAcknowledged: z.boolean({
            invalid_type_error: 'Is Acknowledged must be a boolean',
        }).optional().default(false),
        acknowledgedBy: z.string({
            invalid_type_error: 'Acknowledged By must be a string',
        }).optional().default(''),
    })
);

// Zod Schema for TEmployee
export const employeeSchema = z.object({
    personalInfo: personalDetailsSchema,
    companyDetails: companyDetailsSchema,
    leaveTypes: z.array(leaveTypeSchema, {
        required_error: 'Leave types are required',
        invalid_type_error: 'Leave types must be an array',
    }),
    bankDetails: bankDetailsSchema,
    uploadFiles: uploadFileSchema,
    isDeleted: z.boolean({
        required_error: 'Deletion status is required',
        invalid_type_error: 'Deletion status must be a boolean',
    }).default(false),
});

export const EmployeeValidation = {
    employeeSchema
}
