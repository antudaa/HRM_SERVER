import { Model, Types } from "mongoose";

export type TDepartment = {
    departmentName: string;
    departmentId: string;
    designations?: Types.ObjectId[]
    isDeleted: boolean;
};

export interface DepartmentModel extends Model<TDepartment> {
    // Checking is Department Deleted | Not
    isDepartmentDeleted(id: Types.ObjectId): Promise<TDepartment>;
};