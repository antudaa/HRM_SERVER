import { Model } from "mongoose";

export type TWorkShift = {
    shiftName: string;
    shiftType: "fullday" | "halfday" | "custom";
    shiftStarts: string;
    shiftEnds: string;
    shiftDuration: number;
    shiftStartsDate: Date;
    shiftEndsDate: Date;
    workingHour: number;
    shiftYear?: number;
    isDeleted: boolean;
};

export interface WorkShiftModel extends Model<TWorkShift> {
    isShiftAvailable(shiftName: string): Promise<TWorkShift | null>;
};