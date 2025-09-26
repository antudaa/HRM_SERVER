import { Model, Types } from "mongoose";

export type TDesignation = {
    designationName: string;
    designationId: string;
    department: Types.ObjectId;
    isDeleted: boolean;
};

export interface DesignationModel extends Model<TDesignation> {
    isDesignationDeleted(id: Types.ObjectId): Promise<TDesignation>;
}