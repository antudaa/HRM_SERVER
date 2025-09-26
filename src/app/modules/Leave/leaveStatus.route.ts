import express from "express";
import { LeaveStatusControllers } from "./leaveStatus.controller";
import { authenticateUser } from "../../middlewares/auth";

const router = express.Router();

// GET /api/v1/leave-status/employee/:employeeId?year=2025
router.get("/employee/:employeeId", authenticateUser, LeaveStatusControllers.getSingleEmployeeLeaveStatus);

// GET /api/v1/leave-status?year=2025&orgId=...&departmentId=...&page=1&limit=20&search=rahim
router.get("/", authenticateUser, LeaveStatusControllers.getAllEmployeesLeaveStatus);

export const LeaveStatusRoutes = router;
