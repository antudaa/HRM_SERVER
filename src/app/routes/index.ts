// import { Router } from "express";
// import { AttendanceRoutes } from "../modules/Attendance/attendance.route";
// import { AuthRoutes } from "../modules/Auth/auth.route";
// import { DepartmentRoutes } from "../modules/Department/department.route";
// import { DesignationRoutes } from "../modules/Designation/designation.route";
// import { DocumentRoutes } from "../modules/Document/document.route";
// import { EmployeeRoutes } from "../modules/Employee/employee.route";
// import { GeneralApplicationRoutes } from "../modules/GeneralApplication/generalApplication.route";
// import { NoticeRoutes } from "../modules/Notice/notice.route";
// import { UserRoutes } from "../modules/User/user.route";
// import { WorkShiftRoutes } from "../modules/WorkShift/workShift.route";
// import { FileUploadRoutes } from "../modules/Upload/fileUpload.route";
// import { sendMail, transporter } from "../utils/mailer";
// import { HolidayRoutes } from "../modules/Holiday/holiday.route";

// const router = Router();

// router.get("/test-email/verify", async (_req, res) => {
//   try {
//     await transporter.verify();
//     res.json({ ok: true, message: "SMTP is ready to take our messages" });
//   } catch (err: any) {
//     res.status(500).json({ ok: false, error: err.message, details: err.response });
//   }
// });

// router.post("/test-email", async (req, res) => {
//   try {
//     await sendMail({
//       to: req.body.to,
//       subject: "Test Email from HA Techz HRM",
//       html: "<h1>Hello from HRM</h1><p>This is a test email.</p>",
//     });
//     res.json({ ok: true, message: "Email sent!" });
//   } catch (err: any) {
//     res.status(500).json({ ok: false, error: err.message, debug: err.debug });
//   }
// });

// const moduleRoutes = [
//   {
//     path: `/attendance`,
//     route: AttendanceRoutes,
//   },
//   {
//     path: `/auth`,
//     route: AuthRoutes,
//   },
//   {
//     path: `/department`,
//     route: DepartmentRoutes,
//   },
//   {
//     path: `/designation`,
//     route: DesignationRoutes,
//   },
//   {
//     path: `/workshift`,
//     route: WorkShiftRoutes,
//   },
//   {
//     path: `/document`,
//     route: DocumentRoutes,
//   },
//   {
//     path: `/employee`,
//     route: EmployeeRoutes,
//   },
//   {
//     path: `/general-application`,
//     route: GeneralApplicationRoutes,
//   },
//   {
//     path: `/notice`,
//     route: NoticeRoutes,
//   },
//   {
//     path: `/user`,
//     route: UserRoutes,
//   },
//   {
//     path: `/upload`,
//     route: FileUploadRoutes,
//   },
//   {
//     path: `/holiday`,
//     route: HolidayRoutes,
//   },
// ];

// moduleRoutes.forEach((route) => router.use(route.path, route.route));

// export default router;




// src/routes/index.ts
import { Router } from "express";

// Existing modules
import { AttendanceRoutes } from "../modules/Attendance/attendance.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { DepartmentRoutes } from "../modules/Department/department.route";
import { DesignationRoutes } from "../modules/Designation/designation.route";
import { DocumentRoutes } from "../modules/Document/document.route";
import { EmployeeRoutes } from "../modules/Employee/employee.route";
import { NoticeRoutes } from "../modules/Notice/notice.route";
import { UserRoutes } from "../modules/User/user.route";
import { WorkShiftRoutes } from "../modules/WorkShift/workShift.route";
import { FileUploadRoutes } from "../modules/Upload/fileUpload.route";
import { HolidayRoutes } from "../modules/Holiday/holiday.route";

// NEW: Centralized Applications + Templates + Leave modules
import { ApplicationRoutes } from "../modules/Application/application.routes";
import { ApplicationTemplateRoutes } from "../modules/ApplicationTemplate/applicationTemplate.routes";
import { LeaveStatusRoutes } from "../modules/Leave/leaveStatus.route";

// Mail test helpers
import { sendMail, transporter } from "../utils/mailer";
import { LeaveTypeRoutes } from "../modules/Leave/leaveManagement.routes";
import { LeaveRoutes } from "../modules/Leave/leave.route";

const router = Router();

/** --------- Health / diagnostics for SMTP ---------- */
router.get("/test-email/verify", async (_req, res) => {
  try {
    await transporter.verify();
    res.json({ ok: true, message: "SMTP is ready to take our messages" });
  } catch (err: any) {
    res
      .status(500)
      .json({ ok: false, error: err.message, details: err.response });
  }
});

router.post("/test-email", async (req, res) => {
  try {
    await sendMail({
      to: req.body.to,
      subject: "Test Email from HA Techz HRM",
      html: "<h1>Hello from HRM</h1><p>This is a test email.</p>",
    });
    res.json({ ok: true, message: "Email sent!" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message, debug: err.debug });
  }
});

/** --------- Mount all API module routes ---------- */
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

  // NEW: centralized applications
  { path: "/applications", route: ApplicationRoutes },

  // Backward-compatibility: keep old path working but point to new centralized routes
  { path: "/general-application", route: ApplicationRoutes },

  // NEW: application templates (for body rendering and defaults)
  { path: "/application-templates", route: ApplicationTemplateRoutes },

  // NEW: leave management & status
  { path: "/leave-types", route: LeaveTypeRoutes },
  { path: "/leave-status", route: LeaveStatusRoutes },

  { path: "/leave", route: LeaveRoutes },


];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
