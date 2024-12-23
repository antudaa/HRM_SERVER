import { TEmployee } from "../Employee/employee.interface";
import { Employee } from "../Employee/employee.model";

const createEmployeeIntoDB = async (employeeData: TEmployee) => {
    const result = await Employee.create(employeeData);
    return result;
};

export const UserServices = {
    createEmployeeIntoDB,
}; 