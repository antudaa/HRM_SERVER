import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { AttendanceServices } from "./attendance.service";
import { fetchFingerprintAttendances } from "../../utils/fingerprintmachineconfig";
import AppError from "../../Errors/AppError";
import { Employee } from "../Employee/employee.model";
import { Holiday } from "../Holiday/holiday.model";
import { transformAttendanceData } from "../../utils/attendance";
import { AttendanceData } from "./attendance.model";
import type { TApprovedLeave, THoliday, TEmployeeLite } from "../../utils/attendance";
import { Types } from "mongoose";
import { Application } from "../Application/application.model";

/** preview */
export const downloadFingerprintAttendance = async (_req: Request, res: Response) => {
  try {
    const attendances = await fetchFingerprintAttendances();
    res.status(200).json({ attendances });
  } catch (error) {
    res.status(502).json({ message: (error as any)?.message || error });
  }
};

export const pushAttendanceDataIntoDb = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AttendanceServices.pushAttendanceData();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Attendance data synced successfully.",
      data: result,
    });
  } catch (error: any) {
    next(new AppError(error?.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to fetch/transform/persist attendance data"));
  }
};

const getDayAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = (req.query.date as string) ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return sendResponse(res, { statusCode: httpStatus.BAD_REQUEST, success: false, message: "Query param 'date' must be YYYY-MM-DD" });
    }
    const rows = await AttendanceServices.getDayAttendance(date);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: `Attendance for ${date}`, data: rows });
  } catch (e) { next(e); }
};

const getEmployeeLast7 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { empId } = req.params;
    const data = await AttendanceServices.getEmployeeLast7Days(empId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Last 7 days attendance", data });
  } catch (e) { next(e); }
};

const getEmployeeRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { empId } = req.params;
    const start = (req.query.start as string) ?? "";
    const end = (req.query.end as string) ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return sendResponse(res, { statusCode: httpStatus.BAD_REQUEST, success: false, message: "start and end must be YYYY-MM-DD" });
    }
    const data = await AttendanceServices.getEmployeeByRange(empId, start, end);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: `Attendance from ${start} to ${end}`, data });
  } catch (e) { next(e); }
};

const getEmployeeLastMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { empId } = req.params;
    const data = await AttendanceServices.getEmployeeLastMonth(empId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Last month attendance", data });
  } catch (e) { next(e); }
};

const getCurrentMonthLatesAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const detailed = String(req.query.detailed || "").toLowerCase() === "true";
    const minLate = req.query.minLate ? Number(req.query.minLate) : 0;
    const departmentId = (req.query.departmentId as string) || undefined;
    const sort = (req.query.sort as "asc" | "desc") || "desc";
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;

    if (!detailed) {
      const data = await AttendanceServices.getCurrentMonthLatesAll();
      return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Current month total late minutes per employee", data });
    }

    // use model static directly for detailed variant
    const sortDir = sort === "asc" ? 1 : -1;
    const data = await AttendanceData.getMonthlyLateMinutesForAllDetailed({
      year, month, minLateMinutes: minLate, departmentId, sort: sortDir as 1 | -1, page, limit,
    });

    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Current month total late minutes per employee (detailed)", data });
  } catch (e) { next(e); }
};

const getEmployeeMonthlyLateTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { empId } = req.params;
    const data = await AttendanceServices.getEmployeeMonthlyLateTrend(empId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Monthly late trend", data });
  } catch (e) { next(e); }
};

// helper to align with service’s buildDaySet (kept if you need to do direct ops here)
const buildDaySet = (rec: any) => {
  const now = new Date();
  return {
    "attendanceInfo.$.date": rec.date,
    "attendanceInfo.$.clockIn": rec.clockIn,
    "attendanceInfo.$.clockOut": rec.clockOut,
    "attendanceInfo.$.isWeekend": rec.isWeekend,
    "attendanceInfo.$.isHoliday": rec.isHoliday,
    "attendanceInfo.$.inLeave": rec.inLeave,
    "attendanceInfo.$.leaveType": rec.leaveType,
    "attendanceInfo.$.workHour": rec.workHour,
    "attendanceInfo.$.attendanceType": rec.attendanceType,
    "attendanceInfo.$.shiftStartTime": rec.shiftStartTime,
    "attendanceInfo.$.shiftEndTime": rec.shiftEndTime,
    "attendanceInfo.$.lateby": rec.lateby ?? 0,
    "attendanceInfo.$.earlyClockIn": rec.earlyClockIn ?? 0,
    "attendanceInfo.$.earlyClockOut": rec.earlyClockOut ?? 0,
    "attendanceInfo.$.overTimeHour": rec.overTimeHour ?? 0,
    "attendanceInfo.$.remarks": rec.remarks ?? "",
    "attendanceInfo.$.isManualEntry": !!rec.isManualEntry,
    "attendanceInfo.$.isDeleted": !!rec.isDeleted,
    "attendanceInfo.$.updatedAt": now,
  };
};

/** POST /attendance/rebuild?start=YYYY-MM-DD&end=YYYY-MM-DD  */
const rebuildAttendanceByRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const start = (req.query.start as string) ?? "";
    const end = (req.query.end as string) ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return sendResponse(res, { statusCode: httpStatus.BAD_REQUEST, success: false, message: "start and end must be YYYY-MM-DD" });
    }

    const raw = await fetchFingerprintAttendances();
    const filtered = Array.isArray(raw)
      ? raw.filter((r: any) => {
          const ymd = new Date(r.recordTime).toISOString().slice(0, 10);
          return ymd >= start && ymd <= end;
        })
      : [];

    // employees with runningWorkShift populated (IMPORTANT)
    const empDocs = await Employee.find(
  { "companyDetails.fingerprintAttendanceId": { $exists: true, $ne: "" } },
  {
    "personalInfo.name.fullName": 1,
    "companyDetails.fingerprintAttendanceId": 1,
    "companyDetails.runningWorkShift": 1,
  }
)
  .populate("companyDetails.runningWorkShift", "shiftStarts shiftEnds shiftStartsDate shiftEndsDate")
  .lean();

const employees: TEmployeeLite[] = empDocs.map((e: any) => {
  const rs = e?.companyDetails?.runningWorkShift || {};
  return {
    _id: e._id,
    personalInfo: { name: { fullName: e?.personalInfo?.name?.fullName || "" } },
    companyDetails: {
      fingerprintAttendanceId: e?.companyDetails?.fingerprintAttendanceId || "",
      runningWorkShift: {
        startTime: typeof rs?.shiftStarts === "string" ? rs.shiftStarts : "09:00",
        endTime: typeof rs?.shiftEnds === "string" ? rs.shiftEnds : "18:00",
        startDate: rs?.shiftStartsDate ? new Date(rs.shiftStartsDate).toISOString().slice(0, 10) : undefined,
        endDate: rs?.shiftEndsDate ? new Date(rs.shiftEndsDate).toISOString().slice(0, 10) : undefined,
      },
    },
  };
});

    // leaves window = start..end
    const apps = await Application.find({
      applicationType: "leave",
      currentStatus: "approved",
      isDeleted: { $ne: true },
      isCancelled: { $ne: true },
      fromDate: { $lte: new Date(end + "T23:59:59.999Z") },
      toDate: { $gte: new Date(start + "T00:00:00.000Z") },
    }).select("applicantId fromDate toDate leaveDetails").lean();

    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    const approvedLeaves: TApprovedLeave[] = [];
    for (const a of apps) {
      const employeeId = a.applicantId as unknown as Types.ObjectId;
      const mode = a?.leaveDetails?.leaveMode as ("single" | "multiple" | "halfday" | undefined);
      const effDates: Date[] = Array.isArray(a?.leaveDetails?.effectiveDates) ? a.leaveDetails!.effectiveDates! : [];
      const fromISO = a.fromDate ? toISO(new Date(a.fromDate)) : undefined;
      const toISO_ = a.toDate ? toISO(new Date(a.toDate)) : fromISO;

      if (mode === "halfday") {
        const theDay = effDates?.length ? toISO(new Date(effDates[0])) : fromISO;
        if (theDay) approvedLeaves.push({ employeeId, status: "APPROVED", startDate: theDay, endDate: theDay, leaveType: "halfday" });
        continue;
      }
      if (mode === "multiple" && effDates?.length) {
        for (const d of effDates) {
          const day = toISO(new Date(d));
          approvedLeaves.push({ employeeId, status: "APPROVED", startDate: day, endDate: day, leaveType: "fullday" });
        }
        continue;
      }
      if (fromISO && toISO_) {
        approvedLeaves.push({ employeeId, status: "APPROVED", startDate: fromISO, endDate: toISO_, leaveType: "fullday" });
      }
    }

    const holidays = await Holiday.find({
      startDate: { $lte: end },
      $or: [{ endDate: { $gte: start } }, { endDate: { $exists: false } }],
    }).lean<THoliday[]>();

    const docs = await transformAttendanceData(filtered, { employees, approvedLeaves, holidays });

    const ops: any[] = [];
    for (const emp of docs) {
      ops.push({
        updateOne: {
          filter: { "employeeInfo.empId": emp.employeeInfo.empId },
          update: {
            $setOnInsert: { employeeInfo: emp.employeeInfo, isDeleted: false },
            $set: { fingerprintAttendanceId: emp.fingerprintAttendanceId },
          },
          upsert: true,
        },
      });
      for (const rec of emp.attendanceInfo) {
        ops.push({
          updateOne: {
            filter: { "employeeInfo.empId": emp.employeeInfo.empId, "attendanceInfo.date": rec.date },
            update: { $set: buildDaySet(rec) },
            upsert: false,
          },
        });
        ops.push({
          updateOne: {
            filter: {
              "employeeInfo.empId": emp.employeeInfo.empId,
              attendanceInfo: { $not: { $elemMatch: { date: rec.date } } },
            },
            update: { $push: { attendanceInfo: rec } },
            upsert: false,
          },
        });
      }
    }
    if (ops.length) await AttendanceData.bulkWrite(ops, { ordered: false });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Rebuilt attendance from ${start} to ${end}`,
      data: { employees: docs.length },
    });
  } catch (e) { next(e); }
};

export const AttendanceControllers = {
  downloadFingerprintAttendance,
  pushAttendanceDataIntoDb,
  getDayAttendance,
  getEmployeeLast7,
  getEmployeeRange,
  getEmployeeLastMonth,
  getCurrentMonthLatesAll,
  getEmployeeMonthlyLateTrend,
  rebuildAttendanceByRange,
};
