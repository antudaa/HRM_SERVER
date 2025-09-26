import { Model, Types } from "mongoose";
import { TEmployee } from "../Employee/employee.interface";

export type TAdmin = {
    employeeId: Types.ObjectId;
    adminPrivileges: {
        canManageEmployees: boolean;
        canAccessSensitiveData: boolean;
        canModifyRoles: boolean;
    };
    managedDepartments: Types.ObjectId[];
    isDeleted: boolean;
};

export interface AdminModel extends Model<TAdmin> {
    // Check if an account exists with the same email
    isAccountExistWithSameEmail(email: string): Promise<TAdmin | null>;

    // Check if the admin account is blocked
    isAdminBlocked(id: Types.ObjectId): Promise<boolean>;

    // Promote an employee to admin
    promoteToAdmin(empId: Types.ObjectId): Promise<TAdmin>;

    // Demote an admin to a regular employee
    demoteToEmployee(adminId: Types.ObjectId): Promise<TEmployee>;

    // Fetch all admins 
    getAllAdmins(includeSuperAdmin?: boolean): Promise<TAdmin[]>;

    // Assign a department to an admin
    assignDepartment(adminId: Types.ObjectId, departmentId: Types.ObjectId): Promise<TAdmin>;

    // Remove a department from an admin
    removeDepartment(adminId: Types.ObjectId, departmentId: Types.ObjectId): Promise<TAdmin>;
}