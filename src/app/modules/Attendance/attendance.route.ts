import express from "express";
import { AttendanceControllers } from "./attendance.controller";
import { authenticateUser, authorizeSuperAdmin } from "../../middlewares/auth";

const router = express.Router();

/** Device pull & sync */
router.get("/fingerprint-record", AttendanceControllers.downloadFingerprintAttendance);
router.post("/push-attendancedata", authenticateUser, authorizeSuperAdmin, AttendanceControllers.pushAttendanceDataIntoDb);

/** Queries */
router.get("/day", AttendanceControllers.getDayAttendance);
router.get("/employee/:empId/last7", AttendanceControllers.getEmployeeLast7);
router.get("/employee/:empId/range", AttendanceControllers.getEmployeeRange); // ?start&end
router.get("/employee/:empId/last-month", AttendanceControllers.getEmployeeLastMonth);
router.get("/employee/:empId/late-trend", AttendanceControllers.getEmployeeMonthlyLateTrend);

/** Lates */
router.get("/lates/current-month", AttendanceControllers.getCurrentMonthLatesAll);

/** Backfill/Rebuild (optional) */
router.post("/rebuild", authenticateUser, authorizeSuperAdmin, AttendanceControllers.rebuildAttendanceByRange);

export const AttendanceRoutes = router;
