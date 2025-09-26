import { TDepartment } from "./department.interface";
import { Department } from "./department.model";


const createDepartment = async (payload: TDepartment) => {
    const result = await Department.create(payload);
    return result;
};

const updateDepartment = async (id: string, payload: Partial<TDepartment>) => {
    const result = await Department.findByIdAndUpdate(
        id,
        payload,
        { new: true },
    );
    return result;
};

const archivedDepartment = async (id: string) => {
    const result = await Department.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
    );
    return result;
};

const unArchiveDepartment = async (id: string) => {
    const result = await Department.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true },
    )
    return result;
};

const deleteDepartment = async (id: string) => {
    const result = await Department.findByIdAndDelete(id);
    return result;
};

const getAllDepartment = async () => {
    const result = await Department.find();
    return result;
};

const getActiveDepartment = async () => {
    const result = await Department.find({
        isDeleted: false
    });
    return result;
};

const getArchiveDepartment = async () => {
    const result = await Department.find({
        isDeleted: true
    });
    return result;
}

const getDepartmentById = async (id: string) => {
    const result = await Department.findById(id);
    return result;
};

export const DepartmentServices = {
    createDepartment,
    updateDepartment,
    archivedDepartment,
    unArchiveDepartment,
    deleteDepartment,
    getAllDepartment,
    getActiveDepartment,
    getArchiveDepartment,
    getDepartmentById,
};