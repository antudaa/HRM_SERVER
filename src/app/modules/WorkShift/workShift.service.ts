import { TWorkShift } from "./workShift.interface";
import { WorkShift } from "./workShift.model";

const createWorkShift = async (payload: TWorkShift) => {
    const result = await WorkShift.create(payload);
    return result;
};

const updateWorkShift = async (id: string, payload: Partial<TWorkShift>) => {
    const result = await WorkShift.findByIdAndUpdate(
        id,
        payload,
        { new: true },
    );
    return result;
};

const archivedWorkShift = async (id: string) => {
    const result = await WorkShift.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
    );
    return result;
};

const unArchiveWorkShift = async (id: string) => {
    const result = await WorkShift.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true },
    );
    return result;
};

const deleteWorkShift = async (id: string) => {
    const result = await WorkShift.findByIdAndDelete(id);
    return result;
};

const getAllWorkShift = async () => {
    const result = await WorkShift.find();
    return result;
};

const getActiveWorkShift = async () => {
    const result = await WorkShift.find({
        isDeleted: false,
    });
    return result;
};

const getArchivedWorkShift = async () => {
    const result = await WorkShift.find({
        isDeleted: false,
    });
    return result;
};

const getWorkShiftByID = async (id: string) => {
    const result = await WorkShift.findById(id);
    return result;
};

export const WorkShiftServices = {
    createWorkShift,
    updateWorkShift,
    archivedWorkShift,
    unArchiveWorkShift,
    deleteWorkShift,
    getAllWorkShift,
    getActiveWorkShift,
    getArchivedWorkShift,
    getWorkShiftByID,
}