import { TDesignation } from "./designation.interface";
import { Designation } from "./designation.model";

const createDesignation = async (payload: TDesignation) => {
    const result = await Designation.create(payload);
    return result;
};

const updateDesignation = async (id: string, payload: Partial<TDesignation>) => {
    const result = await Designation.findByIdAndUpdate(
        id,
        payload,
        { new: true },
    );
    return result;
};

const archiveDesignation = async (id: string) => {
    const result = await Designation.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
    );
    return result;
};

const unArchiveDesignation = async (id: string) => {
    const result = await Designation.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true },
    );
    return result;
};

const deleteDesignation = async (id: string) => {
    const result = await Designation.findByIdAndDelete(id);
    return result;
};

const getAllDesignations = async () => {
    const result = await Designation.find().populate('department');
    return result;
};

const getActiveDesignations = async () => {
    const result = await Designation.find({
        isDeleted: false
    }).populate('department');
    return result;
};

const getArchiveDesignations = async () => {
    const result = await Designation.find({
        isDeleted: true
    }).populate('department');
    return result;
};

const getDesignationById = async (id: string) => {
    const result = await Designation.findById(id).populate('department');
    return result;
};

export const DesignationServices = {
    createDesignation,
    updateDesignation,
    archiveDesignation,
    unArchiveDesignation,
    deleteDesignation,
    getAllDesignations,
    getActiveDesignations,
    getArchiveDesignations,
    getDesignationById,
};