import { Router } from "express";
import { AttendanceRoutes } from "../modules/Attendance/attendance.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { DepartmentRoutes } from "../modules/Department/department.route";
import { DesignationRoutes } from "../modules/Designation/designation.route";
import { DocumentRoutes } from "../modules/Document/document.route";
import { EmployeeRoutes } from "../modules/Employee/employee.route";
import { NoticeRoutes } from "../modules/Notice/notice.route";
import UserRoutes from "../modules/User/user.route";
import { WorkShiftRoutes } from "../modules/WorkShift/workShift.route";
import { FileUploadRoutes } from "../modules/Upload/fileUpload.route";
import { HolidayRoutes } from "../modules/Holiday/holiday.route";
import { ApplicationRoutes } from "../modules/Application/application.routes";
import { ApplicationTemplateRoutes } from "../modules/ApplicationTemplate/applicationTemplate.routes";
import { LeaveStatusRoutes } from "../modules/Leave/leaveStatus.route";
import { LeaveTypeRoutes } from "../modules/Leave/leaveManagement.routes";
import { LeaveRoutes } from "../modules/Leave/leave.route";

const router = Router();

const moduleRoutes = [
  { path: "/attendance", route: AttendanceRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/department", route: DepartmentRoutes },
  { path: "/designation", route: DesignationRoutes },
  { path: "/workshift", route: WorkShiftRoutes },
  { path: "/document", route: DocumentRoutes },
  { path: "/employee", route: EmployeeRoutes },
  { path: "/notice", route: NoticeRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/upload", route: FileUploadRoutes },
  { path: "/holiday", route: HolidayRoutes },
  { path: "/applications", route: ApplicationRoutes },
  { path: "/general-application", route: ApplicationRoutes },
  { path: "/application-templates", route: ApplicationTemplateRoutes },
  { path: "/leave-types", route: LeaveTypeRoutes },
  { path: "/leave-status", route: LeaveStatusRoutes },
  { path: "/leave", route: LeaveRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
