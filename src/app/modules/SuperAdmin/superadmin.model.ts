import { model, Schema, Types } from "mongoose";
import { TSuperAdmin, SuperAdminModel } from "./superadmin.interface";
// import { bankDetailsSchema, companyDetailsSchema, employeePerformanceSchema, leaveTypeSchema, personalDetailsSchema, uploadFileSchema } from "../Employee/employee.model";
import { TEmployee } from "../Employee/employee.interface";

// Schema for superAdminPrivileges
const superAdminPrivilegesSchema = new Schema(
    {
        canCreateSuperAdmin: { type: Boolean, required: true, default: false },
        canCreateAdmins: { type: Boolean, required: true, default: false },
        canRemoveAdmins: { type: Boolean, required: true, default: false },
        canManageCompanySettings: { type: Boolean, required: true, default: false },
        canViewAllReports: { type: Boolean, required: true, default: false },
    },
    { _id: false }
);

// SuperAdmin Schema
const superAdminSchema = new Schema<TSuperAdmin, SuperAdminModel>(
    {
        employeeId: { type: Schema.ObjectId, required: true, ref: "Employee" },
        superAdminPrivileges: { type: superAdminPrivilegesSchema, required: true },
        globalAccess: { type: Boolean, required: true, default: false },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export type TSuperAdminPayload = TEmployee & {
    _id?: Types.ObjectId;
    superAdminPrivileges: TSuperAdmin["superAdminPrivileges"];
    globalAccess: boolean;
}
 
// Check if a superadmin exists with the same email
superAdminSchema.statics.isAccountExistWithSameEmail = async function (email: string) {
    return await this.findOne({ "personalInfo.officialEmail": email });
};

// Check if the superadmin account is blocked
superAdminSchema.statics.isSuperAdminBlocked = async function (
    id: Types.ObjectId
): Promise<boolean> {
    const superAdmin = await this.findById(id);
    return superAdmin?.isDeleted || false;
};

// Remove an admin or demote them to a regular employee
superAdminSchema.statics.removeAdmin = async function (
    adminId: Types.ObjectId
): Promise<boolean> {
    const result = await this.findByIdAndUpdate(
        adminId,
        { $set: { superAdminPrivileges: null, globalAccess: false } },
        { new: true }
    );
    return !!result;
};

// Fetch all superadmins
superAdminSchema.statics.getAllSuperAdmins = async function (): Promise<TSuperAdmin[]> {
    return await this.find({ "superAdminPrivileges.canCreateAdmins": true });
};

// Manage company settings
superAdminSchema.statics.updateCompanySettings = async function (
    settings: Record<string, any>
): Promise<boolean> {
    // This could be implemented as an update to a shared settings collection or config.
    // Add the necessary logic here, for now returning true as a placeholder.
    return true;
};

// Retrieve all HRM reports
superAdminSchema.statics.getAllHRMReports = async function (): Promise<any[]> {
    // Add logic to fetch reports, for now returning an empty array.
    return [];
};

// Export the model
export const SuperAdmin = model<TSuperAdmin, SuperAdminModel>("SuperAdmin", superAdminSchema);
