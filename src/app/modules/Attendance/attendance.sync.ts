import cron, { ScheduledTask } from "node-cron";
import { AttendanceServices } from "./attendance.service";

let task: ScheduledTask | null = null;

/** Start the periodic attendance sync (idempotent). */
export function startAttendanceSyncJob() {
  if (task) return task; // prevent double-starts

  // Every 5 minutes by default; you can override via env.
  const expr = process.env.ATTENDANCE_SYNC_CRON || "*/5 * * * *";

  task = cron.schedule(
    expr,
    async () => {
      try {
        await AttendanceServices.pushAttendanceData();
        console.log("[attendance-sync] ok");
      } catch (e: any) {
        console.error("[attendance-sync] failed:", e?.message ?? e);
      }
    },
    {
    //   scheduled: true,
      timezone: "Asia/Dhaka", // your TZ
    }
  );

  console.log(`[attendance-sync] scheduled with CRON "${expr}"`);
  return task;
}

/** Stop the job (used during graceful shutdown). */
export function stopAttendanceSyncJob() {
  if (task) {
    task.stop();
    task = null;
    console.log("[attendance-sync] stopped");
  }
}
