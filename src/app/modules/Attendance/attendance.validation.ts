import { z } from "zod";

export const downloadAttendanceRawDataSchema = z.object({
  userSn: z.number(),
  deviceUserId: z.string(),
  recordTime: z.string(),
  ip: z.string().optional(),
});

export const attendanceInfoSchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  clockIn: z.string(), // "HH:mm"
  clockOut: z.string(), // "HH:mm"
  isWeekend: z.boolean(),
  isHoliday: z.boolean(),
  inLeave: z.boolean(),
  leaveType: z.enum(["fullday", "halfday", "shortleave", "n/a"]).default("n/a"),
  workHour: z.number(), // minutes
  attendanceType: z.enum(["onsite", "adjusted", "remote", "leave", "n/a"]).default("n/a"),
  shiftStartTime: z.string(),
  shiftEndTime: z.string(),
  lateby: z.number().default(0),
  earlyClockIn: z.number().default(0),
  earlyClockOut: z.number().default(0),
  overTimeHour: z.number().optional().default(0),
  remarks: z.string().optional().default(""),
  isManualEntry: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
});

export const attendanceDataSchema = z.object({
  employeeInfo: z.object({
    name: z.string(),
    empId: z.any(),
  }),
  fingerprintAttendanceId: z.string(),
  attendanceInfo: z.array(attendanceInfoSchema),
  isDeleted: z.boolean().default(false),
});

export const AttendanceValidation = {
  downloadAttendanceRawDataSchema,
  attendanceDataSchema,
};
