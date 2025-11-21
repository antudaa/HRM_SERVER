import { model, Schema, Types } from "mongoose";
import {
  AttendanceDataModel,
  DownloadAttendanceRawDataModel,
  TEmployeeAttendance,
  TAttendanceRecord,
  TDownloadAttendanceRawData,
  TDayWiseRow,
} from "./attendance.interface";

const downloadAttendanceRawDataSchema = new Schema<
  TDownloadAttendanceRawData,
  DownloadAttendanceRawDataModel
>({
  userSn: { type: Number, required: true },
  deviceUserId: { type: String, required: true },
  recordTime: { type: String, required: true },
  ip: { type: String },
});

const attendanceInfoSchema = new Schema<TAttendanceRecord>(
  {
    date: { type: String, required: true },
    clockIn: { type: String, required: true },
    clockOut: { type: String, required: true },
    isWeekend: { type: Boolean, required: true },
    isHoliday: { type: Boolean, required: true },
    inLeave: { type: Boolean, required: true, default: false },
    leaveType: { type: String, enum: ["fullday", "halfday", "shortleave", "n/a"], default: "n/a" },
    workHour: { type: Number, required: true, default: 0 },
    attendanceType: { type: String, enum: ["onsite", "adjusted", "remote", "leave", "n/a"], default: "n/a" },
    shiftStartTime: { type: String, required: true },
    shiftEndTime: { type: String, required: true },
    lateby: { type: Number, default: 0 },
    earlyClockIn: { type: Number, default: 0 },
    earlyClockOut: { type: Number, default: 0 },
    overTimeHour: { type: Number, default: 0 },
    remarks: { type: String, default: "" },
    isManualEntry: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true }
);

const attendanceDataSchema = new Schema<TEmployeeAttendance, AttendanceDataModel>(
  {
    employeeInfo: {
      name: { type: String, required: true },
      empId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    },
    fingerprintAttendanceId: { type: String, required: true },
    attendanceInfo: { type: [attendanceInfoSchema], required: true, default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceDataSchema.index({ "employeeInfo.empId": 1 }, { name: "idx_att_empId" });
attendanceDataSchema.index({ "attendanceInfo.date": 1 }, { name: "idx_att_date" });
attendanceDataSchema.index({ "employeeInfo.empId": 1, "attendanceInfo.date": 1 }, { name: "idx_att_emp_date" });

attendanceDataSchema.statics.isAttendanceDataExistsForThisDate = function (date: string) {
  return this.findOne({ "attendanceInfo.date": date });
};

attendanceDataSchema.statics.getByEmployeeAndRange = async function (
  empId: string | Types.ObjectId,
  start: string,
  end: string
) {
  const _id = typeof empId === "string" ? new Types.ObjectId(empId) : empId;
  const rows: { attendanceInfo: TAttendanceRecord[] }[] = await this.aggregate([
    { $match: { "employeeInfo.empId": _id } },
    { $unwind: "$attendanceInfo" },
    { $match: { "attendanceInfo.date": { $gte: start, $lte: end } } },
    { $group: { _id: "$employeeInfo.empId", attendanceInfo: { $push: "$attendanceInfo" } } },
  ]);
  return rows[0]?.attendanceInfo ?? [];
};

attendanceDataSchema.statics.getByDay = async function (date: string) {
  const rows: TDayWiseRow[] = await this.aggregate([
    { $unwind: "$attendanceInfo" },
    { $match: { "attendanceInfo.date": date } },
    { $lookup: { from: "employees", localField: "employeeInfo.empId", foreignField: "_id", as: "emp" } },
    { $unwind: { path: "$emp", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "designations", localField: "emp.companyDetails.designation.id", foreignField: "_id", as: "desig" } },
    { $unwind: { path: "$desig", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        employeeId: "$employeeInfo.empId",
        name: { $ifNull: ["$emp.personalInfo.name.fullName", "$employeeInfo.name"] },
        fingerprintAttendanceId: "$fingerprintAttendanceId",
        record: "$attendanceInfo",
        employeeCode: "$emp.companyDetails.employeeId",
        designationName: { $ifNull: ["$emp.companyDetails.designation.name", "$desig.name"] },
        employee: { companyDetails: { designation: { name: { $ifNull: ["$emp.companyDetails.designation.name", "$desig.name"] } } } },
      },
    },
    { $sort: { employeeCode: 1, name: 1 } },
  ]);
  return rows;
};

attendanceDataSchema.statics.getLastNDays = async function (empId: string | Types.ObjectId, days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  const s = start.toISOString().slice(0, 10);
  const e = end.toISOString().slice(0, 10);
  return this.getByEmployeeAndRange(empId, s, e);
};

attendanceDataSchema.statics.getLastMonth = async function (empId: string | Types.ObjectId) {
  const now = new Date();
  const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
  return this.getByEmployeeAndRange(empId, firstDayPrev, lastDayPrev);
};

attendanceDataSchema.statics.getMonthlyLateMinutesForAll = function () {
  const ym = new Date().toISOString().slice(0, 7);
  return this.aggregate([
    { $unwind: "$attendanceInfo" },
    { $match: { "attendanceInfo.date": { $regex: `^${ym}` } } },
    { $group: { _id: "$employeeInfo.empId", totalLateMinutes: { $sum: "$attendanceInfo.lateby" } } },
  ]);
};

attendanceDataSchema.statics.getMonthlyLateMinutesForAllDetailed = function (opts: {
  year?: number;
  month?: number;
  minLateMinutes?: number;
  departmentId?: Types.ObjectId | string;
  sort?: 1 | -1;
  page?: number;
  limit?: number;
} = {}) {
  const now = new Date();
  const year = opts.year ?? now.getFullYear();
  const month = opts.month ?? now.getMonth() + 1;
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  const minLate = Math.max(0, opts.minLateMinutes ?? 0);
  const sortDir: 1 | -1 = opts.sort ?? -1;
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  const skip = (page - 1) * limit;
  const deptId = opts.departmentId ? new Types.ObjectId(String(opts.departmentId)) : null;

  const pipeline: any[] = [
    { $unwind: "$attendanceInfo" },
    { $match: { "attendanceInfo.date": { $regex: `^${ym}` } } },
    { $group: { _id: "$employeeInfo.empId", totalLateMinutes: { $sum: "$attendanceInfo.lateby" } } },
    { $match: { totalLateMinutes: { $gte: minLate } } },
    { $lookup: { from: "employees", localField: "_id", foreignField: "_id", as: "employee" } },
    { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
    ...(deptId ? [{ $match: { "employee.companyDetails.department.id": deptId } }] : []),
    { $lookup: { from: "departments", localField: "employee.companyDetails.department.id", foreignField: "_id", as: "departmentDoc" } },
    { $unwind: { path: "$departmentDoc", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "designations", localField: "employee.companyDetails.designation.id", foreignField: "_id", as: "designationDoc" } },
    { $unwind: { path: "$designationDoc", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        totalLateMinutes: 1,
        "employee._id": 1,
        "employee.personalInfo.name.fullName": 1,
        "employee.companyDetails.officialEmail": 1,
        "employee.companyDetails.fingerprintAttendanceId": 1,
        "employee.companyDetails.department.id": 1,
        "employee.companyDetails.designation.id": 1,
        departmentName: "$departmentDoc.name",
        designationName: "$designationDoc.name",
        employeeCode: "$employee.companyDetails.employeeId",
      },
    },
    { $sort: { totalLateMinutes: sortDir, _id: 1 } },
    { $skip: skip },
    { $limit: limit },
  ];
  return this.aggregate(pipeline);
};

attendanceDataSchema.statics.getLateViolations = async function (threshold: number = 120) {
  const monthly = await this.getMonthlyLateMinutesForAll();
  return monthly.filter((m: any) => (m?.totalLateMinutes ?? 0) > threshold);
};

attendanceDataSchema.statics.getMonthlyLateTrendPerEmployee = function (empId: string | Types.ObjectId) {
  const _id = typeof empId === "string" ? new Types.ObjectId(empId) : empId;
  return this.aggregate([
    { $match: { "employeeInfo.empId": _id } },
    { $unwind: "$attendanceInfo" },
    { $group: { _id: { yearMonth: { $substr: ["$attendanceInfo.date", 0, 7] } }, totalLateMinutes: { $sum: "$attendanceInfo.lateby" } } },
    { $sort: { "_id.yearMonth": 1 } },
  ]);
};

export const DownloadAttendanceRawData = model<
  TDownloadAttendanceRawData,
  DownloadAttendanceRawDataModel
>("AttendanceRawData", downloadAttendanceRawDataSchema);

export const AttendanceData = model<TEmployeeAttendance, AttendanceDataModel>("AttendanceData", attendanceDataSchema);
