import { model, Schema, Types } from "mongoose";
import { TEmployee } from "../Employee/employee.interface";
import { AdminModel, TAdmin } from "./admin.interface";

// Schema for superAdminPrivileges
const AdminPrivilegesSchema = new Schema(
    {
        canCreateAdmins: { type: Boolean, required: true, default: false },
        canRemoveAdmins: { type: Boolean, required: true, default: false },
        canManageCompanySettings: { type: Boolean, required: true, default: false },
        canViewAllReports: { type: Boolean, required: true, default: false },
    },
    { _id: false }
);

// SuperAdmin Schema
const AdminSchema = new Schema<TAdmin, AdminModel>(
    {
        personalInfo: { type: Schema.Types.Mixed, required: true },
        companyDetails: { type: Schema.Types.Mixed, required: true },
        leaveTypes: { type: Schema.Types.Mixed, required: true },
        bankDetails: { type: Schema.Types.Mixed, required: true },
        uploadFiles: { type: Schema.Types.Mixed, required: true },
        performance: { type: Schema.Types.Mixed, required: true },
        isDeleted: { type: Boolean, default: false },
        adminPrivileges: { type: AdminPrivilegesSchema, required: true },
        managedDepartments: {
            type: [Schema.Types.ObjectId],
            required: false,
            ref: 'Department'
        }
    },
    { timestamps: true }
);

// Check if a superadmin exists with the same email
AdminSchema.statics.isAccountExistWithSameEmail = async function (
    email: string
): Promise<TAdmin | null> {
    return await this.findOne({ "personalInfo.officialEmail": email });
};

// Check if the superadmin account is blocked
AdminSchema.statics.isSuperAdminBlocked = async function (
    id: Types.ObjectId
): Promise<boolean> {
    const superAdmin = await this.findById(id);
    return superAdmin?.isDeleted || false;
};

// Create a new admin
AdminSchema.statics.createEmployee = async function (
    employeeData: TEmployee
): Promise<TEmployee> {
    const newAdmin = new this(employeeData);
    await newAdmin.save();
    return newAdmin;
};

// Remove an admin or demote them to a regular employee
AdminSchema.statics.removeAdmin = async function (
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
AdminSchema.statics.getAllSuperAdmins = async function (): Promise<TAdmin[]> {
    return await this.find({ "superAdminPrivileges.canCreateAdmins": true });
};

// Manage company settings
AdminSchema.statics.updateCompanySettings = async function (
    settings: Record<string, any>
): Promise<boolean> {
    // This could be implemented as an update to a shared settings collection or config.
    // Add the necessary logic here, for now returning true as a placeholder.
    return true;
};

// Retrieve all HRM reports
AdminSchema.statics.getAllHRMReports = async function (): Promise<any[]> {
    // Add logic to fetch reports, for now returning an empty array.
    return [];
};

// Export the model
export const SuperAdmin = model<TAdmin, AdminModel>("Admin", AdminSchema);
