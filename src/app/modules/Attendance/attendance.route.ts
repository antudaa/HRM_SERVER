import express from "express";
import { AttendanceControllers } from "./attendance.controller";
import { authenticateUser, authorizeSuperAdmin } from "../../middlewares/auth";

const router = express.Router();

router.get("/fingerprint-record", AttendanceControllers.downloadFingerprintAttendance);
router.post("/push-attendancedata", authenticateUser, authorizeSuperAdmin, AttendanceControllers.pushAttendanceDataIntoDb);

router.get("/day", AttendanceControllers.getDayAttendance);
router.get("/days", AttendanceControllers.getDaysAttendanceRange);
router.get("/employee/:empId/last7", AttendanceControllers.getEmployeeLast7);
router.get("/employee/:empId/range", AttendanceControllers.getEmployeeRange);
router.get("/employee/:empId/last-month", AttendanceControllers.getEmployeeLastMonth);
router.get("/employee/:empId/late-trend", AttendanceControllers.getEmployeeMonthlyLateTrend);

router.get("/lates/current-month", AttendanceControllers.getCurrentMonthLatesAll);
router.post("/rebuild", authenticateUser, authorizeSuperAdmin, AttendanceControllers.rebuildAttendanceByRange);

export const AttendanceRoutes = router;
