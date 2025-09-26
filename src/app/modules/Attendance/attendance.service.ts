import httpStatus from "http-status";
import AppError from "../../Errors/AppError";
import { transformAttendanceData } from "../../utils/attendance";
import { AttendanceData } from "./attendance.model";
import { Types } from "mongoose";
import { TEmployeeAttendance } from "./attendance.interface";
import { fetchFingerprintAttendances } from "../../utils/fingerprintmachineconfig";
import { Holiday } from "../Holiday/holiday.model";
import { Employee } from "../Employee/employee.model";

// types used by transform (keep your local types as you already had)
import type { TApprovedLeave, THoliday, TEmployeeLite } from "../../utils/attendance";
import { Application } from "../Application/application.model";

/* ----------------------- helpers & mapping functions ---------------------- */

const toBDDay = (iso: string) => {
  const d = new Date(iso);
  const bd = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const y = bd.getFullYear();
  const m = String(bd.getMonth() + 1).padStart(2, "0");
  const day = String(bd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

// Map populated employee doc → TEmployeeLite the transformer expects
function mapEmployeeLite(e: any): TEmployeeLite {
  const rs = e?.companyDetails?.runningWorkShift || {};
  const start = typeof rs?.shiftStarts === "string" ? rs.shiftStarts : "09:00";
  const end = typeof rs?.shiftEnds === "string" ? rs.shiftEnds : "18:00";

  return {
    _id: e._id as Types.ObjectId,
    personalInfo: { name: { fullName: e?.personalInfo?.name?.fullName || "" } },
    companyDetails: {
      fingerprintAttendanceId: e?.companyDetails?.fingerprintAttendanceId || "",
      runningWorkShift: {
        startTime: start, // e.g., "07:00"
        endTime: end,     // e.g., "16:00"
        startDate: rs?.shiftStartsDate ? toISODate(new Date(rs.shiftStartsDate)) : undefined,
        endDate: rs?.shiftEndsDate ? toISODate(new Date(rs.shiftEndsDate)) : undefined,
      },
    },
  };
}

// Applications (approved) → TApprovedLeave[]
async function getApprovedLeavesOverlapping(minDay: string, maxDay: string): Promise<TApprovedLeave[]> {
  const apps = await Application.find({
    applicationType: "leave",
    currentStatus: "approved",
    isDeleted: { $ne: true },
    isCancelled: { $ne: true },
    fromDate: { $lte: new Date(maxDay + "T23:59:59.999Z") },
    toDate: { $gte: new Date(minDay + "T00:00:00.000Z") },
  }).select("applicantId fromDate toDate leaveDetails").lean();

  const out: TApprovedLeave[] = [];
  for (const a of apps) {
    const employeeId = a.applicantId as unknown as Types.ObjectId;
    const mode = a?.leaveDetails?.leaveMode as ("single" | "multiple" | "halfday" | undefined);
    const effDates: Date[] = Array.isArray(a?.leaveDetails?.effectiveDates) ? a.leaveDetails!.effectiveDates! : [];
    const fromISO = a.fromDate ? toISODate(new Date(a.fromDate)) : undefined;
    const toISO_ = a.toDate ? toISODate(new Date(a.toDate)) : fromISO;

    if (mode === "halfday") {
      const theDay = effDates?.length ? toISODate(new Date(effDates[0])) : fromISO;
      if (theDay) out.push({ employeeId, status: "APPROVED", startDate: theDay, endDate: theDay, leaveType: "halfday" });
      continue;
    }
    if (mode === "multiple" && effDates?.length) {
      for (const d of effDates) {
        const day = toISODate(new Date(d));
        out.push({ employeeId, status: "APPROVED", startDate: day, endDate: day, leaveType: "fullday" });
      }
      continue;
    }
    if (fromISO && toISO_) {
      out.push({ employeeId, status: "APPROVED", startDate: fromISO, endDate: toISO_, leaveType: "fullday" });
    }
  }
  return out;
}

// $set builder for positional array element (avoid whole-subdoc $set conflicts)
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
    "attendanceInfo.$.updatedAt": now, // keep subdoc timestamp explicit
  };
};

/* --------------------------------- service -------------------------------- */

const pushAttendanceData = async (): Promise<{
  upserted: number;
  modified: number;
  matched: number;
  docs: TEmployeeAttendance[];
}> => {
  // 1) fetch raw
  let raw: any[];
  try {
    raw = await fetchFingerprintAttendances();
    if (!Array.isArray(raw)) throw new Error("Device returned non-array payload");
  } catch (e: any) {
    throw new AppError(httpStatus.BAD_GATEWAY, `Failed to fetch raw attendance: ${e?.message || e}`);
  }

  // day range in BDT (for leaves/holidays window)
  let minDay: string | null = null;
  let maxDay: string | null = null;
  for (const r of raw) {
    if (!r?.recordTime) continue;
    const d = toBDDay(r.recordTime);
    if (!minDay || d < minDay) minDay = d;
    if (!maxDay || d > maxDay) maxDay = d;
  }
  const todayISO = toISODate(new Date());
  if (!minDay) minDay = todayISO;
  if (!maxDay) maxDay = todayISO;

  // 2) context: employees + runningWorkShift populated + leaves + holidays
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

  const employees: TEmployeeLite[] = empDocs.map(mapEmployeeLite);

  const approvedLeaves = await getApprovedLeavesOverlapping(minDay, maxDay);

  const holidays = await Holiday.find({
    startDate: { $lte: maxDay },
    $or: [{ endDate: { $gte: minDay } }, { endDate: { $exists: false } }],
  }).lean<THoliday[]>();

  // 3) transform (now transformer sees correct shiftStart/End)
  let transformed: TEmployeeAttendance[];
  try {
    transformed = await transformAttendanceData(raw, { employees, approvedLeaves, holidays });
    if (!Array.isArray(transformed)) throw new Error("transformAttendanceData returned non-array");
  } catch (e: any) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `Failed to transform attendance: ${e?.message || e}`);
  }

  // 4) upsert/merge
  try {
    const ops: any[] = [];

    for (const emp of transformed) {
      if (!emp?.employeeInfo?.empId) continue;

      // employee doc upsert (avoid conflicts)
      ops.push({
        updateOne: {
          filter: { "employeeInfo.empId": emp.employeeInfo.empId },
          update: {
            $setOnInsert: {
              employeeInfo: emp.employeeInfo,
              isDeleted: false,
            },
            $set: { fingerprintAttendanceId: emp.fingerprintAttendanceId },
          },
          upsert: true,
        },
      });

      // per-day merge (update if exists else push)
      for (const rec of emp.attendanceInfo) {
        if (!rec?.date) continue;

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

    if (!ops.length) return { upserted: 0, modified: 0, matched: 0, docs: [] };

    const bulk = await AttendanceData.bulkWrite(ops, { ordered: false });

    return {
      upserted: bulk.upsertedCount || 0,
      // @ts-ignore
      modified: bulk.modifiedCount || bulk.nModified || 0,
      // @ts-ignore
      matched: bulk.matchedCount || bulk.nMatched || 0,
      docs: transformed,
    };
  } catch (e: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to persist attendance: ${e?.message || e}`);
  }
};

/* ----------------------------- queries ----------------------------- */

const getDayAttendance = async (date: string) => AttendanceData.getByDay(date);
const getEmployeeLast7Days = async (empId: string | Types.ObjectId) => AttendanceData.getLastNDays(empId, 7);
const getEmployeeByRange = async (empId: string | Types.ObjectId, start: string, end: string) =>
  AttendanceData.getByEmployeeAndRange(empId, start, end);
const getEmployeeLastMonth = async (empId: string | Types.ObjectId) => AttendanceData.getLastMonth(empId);
const getCurrentMonthLatesAll = async () => AttendanceData.getMonthlyLateMinutesForAll();
const getEmployeeMonthlyLateTrend = async (empId: string | Types.ObjectId) =>
  AttendanceData.getMonthlyLateTrendPerEmployee(empId);

const enforceLatePolicies = async (warnThreshold = 90, deductThreshold = 120) => {
  const totals = await AttendanceData.getMonthlyLateMinutesForAll();
  const offendersWarn = totals.filter((t: any) => t.totalLateMinutes >= warnThreshold && t.totalLateMinutes < deductThreshold);
  const offendersDeduct = totals.filter((t: any) => t.totalLateMinutes >= deductThreshold);
  return {
    warnedCount: offendersWarn.length,
    deductedCount: offendersDeduct.length,
    warned: offendersWarn,
    deducted: offendersDeduct,
  };
};

export const AttendanceServices = {
  pushAttendanceData,
  getDayAttendance,
  getEmployeeLast7Days,
  getEmployeeByRange,
  getEmployeeLastMonth,
  getCurrentMonthLatesAll,
  getEmployeeMonthlyLateTrend,
  enforceLatePolicies,
};
