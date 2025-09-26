import { Model } from "mongoose";

export type THoliday = {
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface HolidayModel extends Model<THoliday> {
  getByRange(start: string, end: string): Promise<THoliday[]>;
  getActive(): Promise<THoliday[]>;
}
