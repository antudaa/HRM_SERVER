// src/app/modules/Attendance/attendance.interface.ts
import { Model, Types } from "mongoose";

/** Raw rows pulled from the fingerprint machine */
export type TDownloadAttendanceRawData = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
  ip?: string;
};

export interface DownloadAttendanceRawDataModel extends Model<TDownloadAttendanceRawData> {}

/** One day’s processed attendance info */
export type TAttendanceRecord = {
  date: string; // 'YYYY-MM-DD'
  clockIn: string; // 'HH:mm'
  clockOut: string; // 'HH:mm'
  isWeekend: boolean;
  isHoliday: boolean;
  inLeave: boolean;
  leaveType: "fullday" | "halfday" | "shortleave" | "n/a";
  workHour: number; // minutes
  attendanceType: "onsite" | "adjusted" | "remote" | "leave" | "n/a";
  shiftStartTime: string;
  shiftEndTime: string;
  lateby: number;
  earlyClockIn: number;
  earlyClockOut: number;
  overTimeHour?: number;
  remarks?: string;
  isManualEntry: boolean;
  isDeleted: boolean;
};

/** Aggregated document per employee with many days */
export type TEmployeeAttendance = {
  employeeInfo: {
    name: string;
    empId: Types.ObjectId;
  };
  fingerprintAttendanceId: string;
  attendanceInfo: TAttendanceRecord[];
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: boolean;
};

/** Day view row returned by getByDay */
export type TDayWiseRow = {
  employeeId: Types.ObjectId;
  /** NEW: human-friendly company code, e.g. EMP0005 */
  employeeCode?: string;
  name: string;
  fingerprintAttendanceId: string;
  record: TAttendanceRecord;
  /** OPTIONAL: convenient display name for designation/post */
  designationName?: string;
};

/** OPTIONAL detailed late minutes row (projection from aggregation) */
export type TLateMinutesDetailed = {
  _id: Types.ObjectId;
  totalLateMinutes: number;
  employee?: {
    _id: Types.ObjectId;
    personalInfo?: { name?: { fullName?: string } };
    companyDetails?: {
      officialEmail?: string;
      department?: { id?: Types.ObjectId; name?: string };
      designation?: { id?: Types.ObjectId; name?: string };
      fingerprintAttendanceId?: string;
    };
  };
};

export interface AttendanceDataModel extends Model<TEmployeeAttendance> {
  isAttendanceDataExistsForThisDate(date: string): Promise<TEmployeeAttendance | null>;

  getByEmployeeAndRange(
    empId: string | Types.ObjectId,
    start: string,
    end: string
  ): Promise<TAttendanceRecord[]>;

  /** UPDATED return type with employeeCode/designationName considered */
  getByDay(date: string): Promise<TDayWiseRow[]>;

  getLastNDays(empId: string | Types.ObjectId, days: number): Promise<TAttendanceRecord[]>;
  getLastMonth(empId: string | Types.ObjectId): Promise<TAttendanceRecord[]>;

  getMonthlyLateMinutesForAll(): Promise<{ _id: Types.ObjectId; totalLateMinutes: number }[]>;

  getMonthlyLateMinutesForAllDetailed(opts?: {
    year?: number;
    month?: number;
    minLateMinutes?: number;
    departmentId?: Types.ObjectId | string;
    sort?: 1 | -1;
    page?: number;
    limit?: number;
  }): Promise<TLateMinutesDetailed[]>;

  getLateViolations(threshold?: number): Promise<{ _id: Types.ObjectId; totalLateMinutes: number }[]>;

  getMonthlyLateTrendPerEmployee(
    empId: string | Types.ObjectId
  ): Promise<{ _id: { yearMonth: string }; totalLateMinutes: number }[]>;
}
