import httpStatus from "http-status";
import AppError from "../../Errors/AppError";
import { transformAttendanceData } from "../../utils/attendance";
import { AttendanceData } from "./attendance.model";
import { Types } from "mongoose";
import { TEmployeeAttendance } from "./attendance.interface";
import { fetchFingerprintAttendances } from "../../utils/fingerprintmachineconfig";
import { Holiday } from "../Holiday/holiday.model";
import { Employee } from "../Employee/employee.model";
import { Application } from "../Application/application.model";
import type { TApprovedLeave, THoliday, TEmployeeLite } from "../../utils/attendance";

type PopulatedWorkShift = {
  shiftStarts?: string;
  shiftEnds?: string;
  shiftStartsDate?: Date | string;
  shiftEndsDate?: Date | string;
};

const datesBetween = (start: string, end: string) => {
  const out: string[] = [];
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out;
};

const asWorkShift = (v: unknown): PopulatedWorkShift => {
  const maybe = v as any;
  const isObj = v && typeof v === "object";
  const isOid = isObj && (maybe instanceof Types.ObjectId || typeof maybe?.toHexString === "function");
  return isObj && !isOid ? (maybe as PopulatedWorkShift) : {};
};

const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const toBDDay = (iso: string) => {
  const d = new Date(iso);
  const bd = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const y = bd.getFullYear();
  const m = String(bd.getMonth() + 1).padStart(2, "0");
  const day = String(bd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const isWeekendBD = (dateISO: string) => {
  const dow = new Date(`${dateISO}T00:00:00+06:00`).getUTCDay();
  return dow === 5 || dow === 6;
};

const getApprovedLeavesOverlapping = async (minDay: string, maxDay: string): Promise<TApprovedLeave[]> => {
  const apps = await Application.find({
    applicationType: "leave",
    currentStatus: "approved",
    isDeleted: { $ne: true },
    isCancelled: { $ne: true },
    fromDate: { $lte: new Date(maxDay + "T23:59:59.999Z") },
    toDate: { $gte: new Date(minDay + "T00:00:00.000Z") },
  })
    .select("applicantId fromDate toDate leaveDetails")
    .lean();

  const out: TApprovedLeave[] = [];
  for (const a of apps) {
    const employeeId = a.applicantId as unknown as Types.ObjectId;
    const mode = a?.leaveDetails?.leaveMode as "single" | "multiple" | "halfday" | undefined;
    const effDates: Date[] = Array.isArray(a?.leaveDetails?.effectiveDates) ? a.leaveDetails!.effectiveDates! : [];
    const fromISO = a.fromDate ? toISODate(new Date(a.fromDate)) : undefined;
    const toISO_ = a.toDate ? toISODate(new Date(a.toDate)) : fromISO;

    if (mode === "halfday") {
      const theDay = effDates?.length ? toISODate(new Date(effDates[0])) : fromISO;
      if (theDay) out.push({ employeeId, status: "APPROVED", startDate: theDay, endDate: theDay, leaveType: "halfday" });
      continue;
    }
    if (mode === "multiple" && effDates?.length) {
      for (const d of effDates) out.push({ employeeId, status: "APPROVED", startDate: toISODate(new Date(d)), endDate: toISODate(new Date(d)), leaveType: "fullday" });
      continue;
    }
    if (fromISO && toISO_) out.push({ employeeId, status: "APPROVED", startDate: fromISO, endDate: toISO_, leaveType: "fullday" });
  }
  return out;
};

const pushAttendanceData = async (): Promise<{
  upserted: number;
  modified: number;
  matched: number;
  docs: TEmployeeAttendance[];
}> => {
  let raw: any[];
  try {
    raw = await fetchFingerprintAttendances();
    if (!Array.isArray(raw)) throw new Error("Device returned non-array payload");
  } catch (e: any) {
    throw new AppError(httpStatus.BAD_GATEWAY, `Failed to fetch raw attendance: ${e?.message || e}`);
  }

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

  const empDocs = await Employee.find(
    { "companyDetails.fingerprintAttendanceId": { $exists: true, $ne: "" } },
    {
      "personalInfo.name.fullName": 1,
      "companyDetails.fingerprintAttendanceId": 1,
      "companyDetails.runningWorkShift": 1,
    }
  )
    .populate({
      path: "companyDetails.runningWorkShift",
      select: "shiftStarts shiftEnds shiftStartsDate shiftEndsDate",
      model: "WorkShift",
    })
    .lean();

  const employees: TEmployeeLite[] = empDocs.map((e: any) => {
    const rs = asWorkShift(e?.companyDetails?.runningWorkShift);
    return {
      _id: e._id,
      personalInfo: { name: { fullName: e?.personalInfo?.name?.fullName || "" } },
      companyDetails: {
        fingerprintAttendanceId: e?.companyDetails?.fingerprintAttendanceId || "",
        runningWorkShift: {
          startTime: rs.shiftStarts ?? "09:00",
          endTime: rs.shiftEnds ?? "18:00",
          startDate: rs?.shiftStartsDate ? toISODate(new Date(rs.shiftStartsDate)) : undefined,
          endDate: rs?.shiftEndsDate ? toISODate(new Date(rs.shiftEndsDate)) : undefined,
        },
      },
    };
  });

  const approvedLeaves = await getApprovedLeavesOverlapping(minDay, maxDay);
  const holidays = await Holiday.find({
    startDate: { $lte: maxDay },
    $or: [{ endDate: { $gte: minDay } }, { endDate: { $exists: false } }],
  }).lean<THoliday[]>();

  let transformed: TEmployeeAttendance[];
  try {
    transformed = await transformAttendanceData(raw, { employees, approvedLeaves, holidays });
    if (!Array.isArray(transformed)) throw new Error("transformAttendanceData returned non-array");
  } catch (e: any) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `Failed to transform attendance: ${e?.message || e}`);
  }

  try {
    const ops: any[] = [];
    for (const emp of transformed) {
      if (!emp?.employeeInfo?.empId) continue;

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
        if (!rec?.date) continue;

        ops.push({
          updateOne: {
            filter: { "employeeInfo.empId": emp.employeeInfo.empId, "attendanceInfo.date": rec.date },
            update: {
              $set: {
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
                "attendanceInfo.$.updatedAt": new Date(),
              },
            },
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

    const bulk = await (AttendanceData as any).bulkWrite(ops, { ordered: false });
    return {
      upserted: bulk.upsertedCount || 0,
      modified: bulk.modifiedCount || bulk.nModified || 0,
      matched: bulk.matchedCount || bulk.nMatched || 0,
      docs: transformed,
    };
  } catch (e: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to persist attendance: ${e?.message || e}`);
  }
};

export const getDayAttendance = async (date: string, opts?: { autofill?: boolean }) => {
  const base = await AttendanceData.getByDay(date);
  if (!opts?.autofill) return base;

  const present = new Set<string>(base.map((r: any) => String(r.employeeId)));

  // ✅ Include ALL active employees; do not require fingerprint ID for autofill
  const empDocs = await Employee.find(
    { isDeleted: { $ne: true } },
    {
      "personalInfo.name.fullName": 1,
      "companyDetails.employeeId": 1,
      "companyDetails.fingerprintAttendanceId": 1,
      "companyDetails.designation.name": 1,
      "companyDetails.designation.id": 1,
      "companyDetails.runningWorkShift": 1,
    }
  )
    .populate({ path: "companyDetails.designation.id", select: "name", model: "Designation" })
    .populate({ path: "companyDetails.runningWorkShift", select: "shiftStarts shiftEnds shiftStartsDate shiftEndsDate", model: "WorkShift" })
    .lean();

  const isHoliday = !!(await Holiday.findOne({
    startDate: { $lte: date },
    $or: [{ endDate: { $gte: date } }, { endDate: { $exists: false } }],
  }).lean());

  const approvedLeaves = await getApprovedLeavesOverlapping(date, date);
  const leaveMap = new Map<string, "fullday" | "halfday">();
  for (const l of approvedLeaves) {
    const key = String(l.employeeId);
    const current = leaveMap.get(key);
    if (!current) leaveMap.set(key, l.leaveType as any);
    else if (l.leaveType === "halfday") leaveMap.set(key, "halfday");
  }

  const weekend = isWeekendBD(date);

  for (const e of empDocs) {
    const id = String(e._id);
    if (present.has(id)) continue;

    const rs = asWorkShift(e?.companyDetails?.runningWorkShift);
    const startTime = rs.shiftStarts ?? "09:00";
    const endTime = rs.shiftEnds ?? "18:00";

    const designationName =
      e?.companyDetails?.designation ||
      (typeof (e as any)?.designation?.name === "string" ? (e as any).designation.name : "");

    const leaveType = leaveMap.get(id) ?? "n/a";
    const inLeave = leaveType !== "n/a";

    base.push({
      employeeId: e._id,
      name: e?.personalInfo?.name?.fullName || "",
      fingerprintAttendanceId: e?.companyDetails?.fingerprintAttendanceId || "",
      employeeCode: e?.companyDetails?.employeeId || null,
      employee: { companyDetails: { designation: { name: designationName || "" } } },
      designationName,
      record: {
        date,
        clockIn: "",
        clockOut: "",
        isWeekend: weekend,
        isHoliday,
        inLeave,
        leaveType: inLeave ? (leaveType as any) : "n/a",
        workHour: 0,
        attendanceType: inLeave ? "leave" : "n/a",
        shiftStartTime: startTime,
        shiftEndTime: endTime,
        lateby: 0,
        earlyClockIn: 0,
        earlyClockOut: 0,
        overTimeHour: 0,
        remarks: "",
        isManualEntry: false,
        isDeleted: false,
      },
    } as any);
  }

  base.sort(
    (a: any, b: any) =>
      String(a.employeeCode ?? "").localeCompare(String(b.employeeCode ?? "")) ||
      String(a.name ?? "").localeCompare(String(b.name ?? ""))
  );

  return base;
};

const getDaysAttendanceRange = async (
  start: string,
  end: string,
  opts?: { autofill?: boolean }
): Promise<{ start: string; end: string; days: Record<string, any[]> }> => {
  const days = datesBetween(start, end);
  const result: Record<string, any[]> = {};

  const PAR = 5; // simple batching
  for (let i = 0; i < days.length; i += PAR) {
    const batch = days.slice(i, i + PAR);
    const chunk = await Promise.all(
      batch.map(async (d) => {
        const rows = await getDayAttendance(d, { autofill: !!opts?.autofill });
        return { d, rows };
      })
    );
    for (const { d, rows } of chunk) result[d] = rows;
  }

  return { start, end, days: result };
};

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
  return { warnedCount: offendersWarn.length, deductedCount: offendersDeduct.length, warned: offendersWarn, deducted: offendersDeduct };
};

export const AttendanceServices = {
  pushAttendanceData,
  getDayAttendance,
  getDaysAttendanceRange,
  getEmployeeLast7Days,
  getEmployeeByRange,
  getEmployeeLastMonth,
  getCurrentMonthLatesAll,
  getEmployeeMonthlyLateTrend,
  enforceLatePolicies,
};
