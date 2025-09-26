import { Types } from "mongoose";
import { TEmployee } from "../Employee/employee.interface";
import { Employee } from "../Employee/employee.model";

const findLastEmployeeId = async (departmentCode: string) => {
    const lastEmployee = await Employee.findOne(
        {
            'companyDetails.department.department': departmentCode,
        },
        {
            'companyDetails.employeeId': 1,
            _id: 0,
        },
    )
        .sort({
            createdAt: -1,
        })
        .lean();

    return lastEmployee?.companyDetails.employeeId ? lastEmployee.companyDetails.employeeId : undefined;
};

const findLastDepartmentEmpId = async (departmentId: Types.ObjectId) => {
    const lastEmployee = await Employee.findOne(
        { 'companyDetails.department.department': departmentId },
        { 'companyDetails.department.departmentEmpId': 1, _id: 0 }
    )
        .sort({ 'companyDetails.department.departmentEmpId': -1 })
        .lean();

    return lastEmployee?.companyDetails.department.departmentEmpId || "00000";
};


export const generateEmployeeID = async (payload: TEmployee) => {
    const departmentId = payload.companyDetails.department.id;

    // Generate the departmentEmpId
    const lastDepartmentEmpId = await findLastDepartmentEmpId(departmentId);
    const incrementedDepartmentEmpId = (Number(lastDepartmentEmpId) + 1).toString().padStart(5, '0');

    // Generate the employeeId
    const departmentCode = departmentId.toString().slice(-3);
    const lastEmployeeID = await findLastEmployeeId(departmentCode);
    let currentId = "00000";

    if (lastEmployeeID) {
        currentId = lastEmployeeID.substring(lastEmployeeID.lastIndexOf('-') + 1);
    }

    const incrementId = (Number(currentId) + 1).toString().padStart(5, '0');
    const newEmployeeId = `EMP-${departmentCode}-${incrementId}`;

    // Set the departmentEmpId in the payload
    payload.companyDetails.department.departmentEmpId = incrementedDepartmentEmpId;

    return { newEmployeeId, departmentEmpId: incrementedDepartmentEmpId };
};