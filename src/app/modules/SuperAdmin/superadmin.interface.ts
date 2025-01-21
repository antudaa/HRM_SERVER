import { Model, Types } from "mongoose";
import { TBankDetials, TCompanyDetails, TEmployee, TEmployeePerformance, TLeaveType, TPersonalDetails, TUploadFiles } from "../Employee/employee.interface";

export type TSuperAdmin = {
    personalInfo: TPersonalDetails;
    companyDetails: TCompanyDetails;
    leaveTypes: TLeaveType[];
    bankDetails: TBankDetials;
    uploadFiles: TUploadFiles;
    performance: TEmployeePerformance;
    superAdminPrivileges: {
        canCreateSuperAdmin: boolean;
        canCreateAdmins: boolean;
        canRemoveAdmins: boolean;
        canManageCompanySettings: boolean;
        canViewAllReports: boolean;
    };
    globalAccess: boolean;
    isDeleted: boolean;
};

export interface SuperAdminModel extends Model<TSuperAdmin> {
    // Check if a superadmin exists with the same email
    isAccountExistWithSameEmail(email: string): Promise<TSuperAdmin | null>;

    // Check if the superadmin account is blocked
    isSuperAdminBlocked(id: Types.ObjectId): Promise<boolean>;

    // Create a new admin
    createEmployee(employeeData: TEmployee): Promise<TEmployee>;

    // Remove an admin or demote them to a regular employee
    removeAdmin(adminId: Types.ObjectId): Promise<boolean>;

    // Fetch all superadmins
    getAllSuperAdmins(): Promise<TSuperAdmin[]>;

    // Manage company settings
    updateCompanySettings(settings: Record<string, any>): Promise<boolean>;

    // Retrieve all HRM reports
    getAllHRMReports(): Promise<any[]>;
}
