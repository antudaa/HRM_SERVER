import { Types } from "mongoose";
import { eachDayOfInterval, format, parseISO, isBefore, isAfter } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  TDownloadAttendanceRawData,
  TAttendanceRecord,
  TEmployeeAttendance,
} from "../modules/Attendance/attendance.interface";

const TZ = "Asia/Dhaka";

/** NORMALIZED Shift shapes your DB may have */
type TShiftObj = {
  name?: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  startDate?: string;
  endDate?: string;
};

/** Employee fields used by transform (💡 tolerant to ObjectId OR embedded objects) */
export type TEmployeeLite = {
  _id: Types.ObjectId;
  name?: string;
  personalInfo?: { name?: { fullName?: string } };
  companyDetails?: {
    fingerprintAttendanceId?: string;
    runningWorkShift?: Types.ObjectId | TShiftObj | null;
    workShifts?: Array<Types.ObjectId | (TShiftObj & { startDate: string })>;
  };
};

export type TApprovedLeave = {
  employeeId: Types.ObjectId;
  status: "APPROVED" | "PENDING" | "REJECTED";
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  leaveType?: "fullday" | "halfday" | "shortleave" | string;
};

export type THoliday = {
  name: string;
  startDate: string;
  endDate?: string;
};

const toBD = (d: Date) => toZonedTime(d, TZ);
const yyyyMmDdBD = (d: Date) => format(toBD(d), "yyyy-MM-dd");
const hhmmBD = (d: Date) => format(toBD(d), "HH:mm");

const isWeekendBD = (dateISO: string) => {
  const d = toBD(new Date(dateISO + "T00:00:00.000Z"));
  const day = d.getDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
};

const dateWithin = (target: string, start: string, end?: string) => {
  const t = parseISO(target);
  const s = parseISO(start);
  const e = end ? parseISO(end) : s;
  return !(isBefore(t, s) || isAfter(t, e));
};

const minutesBetween = (d1: Date, d2: Date) =>
  Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 60000));

const reduceDayLogs = (stampsUTC: Date[]) => {
  if (!stampsUTC.length) return { inTime: "00:00", outTime: "00:00", workMin: 0 };
  stampsUTC.sort((a, b) => a.getTime() - b.getTime());
  const first = stampsUTC[0];
  const last = stampsUTC[stampsUTC.length - 1];
  return { inTime: hhmmBD(first), outTime: hhmmBD(last), workMin: minutesBetween(first, last) };
};

/** Get shift times:
 * - prefer past workShifts with matching date range (when embedded objects are present)
 * - else use runningWorkShift if it’s an object
 * - else default 09:00–18:00
 */
const pickShiftForDate = (emp: TEmployeeLite, day: string) => {
  const cds = emp.companyDetails;

  // Check historical shifts if embedded objects exist
  const past = (cds?.workShifts ?? []).filter(
    (w): w is TShiftObj & { startDate: string } =>
      !!w && typeof w === "object" && "startTime" in w && "endTime" in w && "startDate" in w
  );
  for (const s of past) {
    if (dateWithin(day, s.startDate, s.endDate)) {
      return { start: s.startTime, end: s.endTime };
    }
  }

  // Running shift if embedded
  const run = cds?.runningWorkShift;
  if (run && typeof run === "object" && "startTime" in run && "endTime" in run) {
    return { start: run.startTime, end: run.endTime };
  }

  // Fallback
  return { start: "09:00", end: "18:00" };
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x || "0", 10));
  return (h || 0) * 60 + (m || 0);
}

/** (rest of your transformAttendanceData stays the same) */


/**
 * Transforms raw device rows into per-employee daily records across a full date range,
 * including weekends and holidays, and marks inLeave only for APPROVED leaves.
 */
export async function transformAttendanceData(
  raw: TDownloadAttendanceRawData[],
  opts: {
    employees: TEmployeeLite[];
    approvedLeaves: TApprovedLeave[];
    holidays: THoliday[];
  }
): Promise<TEmployeeAttendance[]> {
  const { employees, approvedLeaves, holidays } = opts;

  // map deviceId -> employee
  const byDevice = new Map<string, TEmployeeLite>();
  for (const e of employees) {
    const id = e.companyDetails?.fingerprintAttendanceId;
    if (id) byDevice.set(id, e);
  }

  // group raw logs by employeeId -> date (BDT)
  type DayMap = Map<string, Date[]>;
  const logsByEmp: Map<string, DayMap> = new Map();

  let minDay: string | null = null;
  let maxDay: string | null = null;

  for (const row of raw) {
    const deviceId = row.deviceUserId;
    const emp = byDevice.get(deviceId);
    if (!emp?._id) continue;
    const stamp = new Date(row.recordTime); // UTC ISO
    const day = yyyyMmDdBD(stamp);
    if (!logsByEmp.has(String(emp._id))) logsByEmp.set(String(emp._id), new Map());
    const dm = logsByEmp.get(String(emp._id))!;
    if (!dm.has(day)) dm.set(day, []);
    dm.get(day)!.push(stamp);

    if (!minDay || day < minDay) minDay = day;
    if (!maxDay || day > maxDay) maxDay = day;
  }

  // extend range by approved leaves and holidays
  for (const lv of approvedLeaves.filter(l => l.status === "APPROVED")) {
    if (!minDay || lv.startDate < minDay) minDay = lv.startDate;
    if (!maxDay || lv.endDate > maxDay) maxDay = lv.endDate;
  }
  for (const h of holidays) {
    const hend = h.endDate ?? h.startDate;
    if (!minDay || h.startDate < minDay) minDay = h.startDate;
    if (!maxDay || hend > maxDay) maxDay = hend;
  }

  if (!minDay || !maxDay) return [];

  const leavesByEmp = new Map<string, TApprovedLeave[]>();
  for (const lv of approvedLeaves.filter(l => l.status === "APPROVED")) {
    const k = String(lv.employeeId);
    if (!leavesByEmp.has(k)) leavesByEmp.set(k, []);
    leavesByEmp.get(k)!.push(lv);
  }

  const isHoliday = (dateISO: string) => {
    for (const h of holidays) {
      if (dateWithin(dateISO, h.startDate, h.endDate)) return true;
    }
    return false;
  };

  const dateList = eachDayOfInterval({ start: parseISO(minDay), end: parseISO(maxDay) })
    .map(d => format(d, "yyyy-MM-dd"));

  const out: TEmployeeAttendance[] = [];

  for (const emp of employees) {
    const empId = String(emp._id);
    const dm = logsByEmp.get(empId) ?? new Map<string, Date[]>();
    const fullName = emp.personalInfo?.name?.fullName || "Unknown";
    const fingerprintAttendanceId = emp.companyDetails?.fingerprintAttendanceId || "";

    const arr: TAttendanceRecord[] = [];

    for (const day of dateList) {
      const weekend = isWeekendBD(day);
      const holiday = isHoliday(day);

      // approved leave?
      let inLeave = false;
      let leaveType: TAttendanceRecord["leaveType"] = "n/a";
      const lvList = leavesByEmp.get(empId) || [];
      for (const lv of lvList) {
        if (dateWithin(day, lv.startDate, lv.endDate)) {
          inLeave = true;
          leaveType = (lv.leaveType as any) || "fullday";
          break;
        }
      }

      const logs = dm.get(day) || [];
      const { inTime, outTime, workMin } = reduceDayLogs(logs);

      const shift = pickShiftForDate(emp, day);

      const lateby = logs.length ? Math.max(0, toMinutes(inTime) - toMinutes(shift.start)) : 0;
      const earlyClockOut = logs.length ? Math.max(0, toMinutes(shift.end) - toMinutes(outTime)) : 0;
      const earlyClockIn = logs.length ? Math.max(0, toMinutes(shift.start) - toMinutes(inTime)) : 0;

      const attendanceType: TAttendanceRecord["attendanceType"] =
        inLeave ? "leave" : (logs.length ? "onsite" : "n/a");

      arr.push({
        date: day,
        clockIn: inTime,
        clockOut: outTime,
        isWeekend: weekend,
        isHoliday: holiday,
        inLeave,
        leaveType,
        workHour: workMin, // minutes
        attendanceType,
        shiftStartTime: shift.start,
        shiftEndTime: shift.end,
        lateby,
        earlyClockIn,
        earlyClockOut,
        overTimeHour: 0,
        remarks: "",
        isManualEntry: false,
        isDeleted: false,
      });
    }

    out.push({
      employeeInfo: { name: fullName, empId: emp._id },
      fingerprintAttendanceId,
      attendanceInfo: arr,
      isDeleted: false,
    });
  }

  return out;
}
