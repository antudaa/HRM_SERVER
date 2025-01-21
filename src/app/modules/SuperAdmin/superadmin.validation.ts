import { z } from "zod";
import { bankDetailsSchema, companyDetailsSchema, leaveTypeSchema, performanceReviewSchema, personalDetailsSchema, uploadFileSchema } from "../Employee/employee.validation";

export const superAdminZodSchema = z.object({
    personalInfo: personalDetailsSchema.optional(),
    companyDetails: companyDetailsSchema.optional(),
    leaveTypes: z.array(leaveTypeSchema).optional(),
    bankDetails: bankDetailsSchema.optional(),
    uploadFiles: uploadFileSchema.optional(),
    performance: performanceReviewSchema.optional(),
    superAdminPrivileges: z.object({
        canCreateSuperAdmin: z.boolean().optional().default(false),
        canCreateAdmins: z.boolean().optional().default(false),
        canRemoveAdmins: z.boolean().optional().default(false),
        canManageCompanySettings: z.boolean().optional().default(false),
        canViewAllReports: z.boolean().optional().default(false),
    }).optional().default({}),
    globalAccess: z.boolean().optional().default(false),
    isDeleted: z.boolean().optional().default(false),
});