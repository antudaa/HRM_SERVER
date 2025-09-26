// import { Types } from "mongoose";
// import { Employee } from "../Employee/employee.model";
// import { EmployeeLeaveBalance } from "./employeeLeaveBalance.model";
// import { Application } from "../LeaveApplication/leaveApplication.model";

// type AllEmployeesLeaveQuery = {
//   year?: number;
//   orgId?: string;
//   departmentId?: string;
//   designationId?: string;
//   page?: number;
//   limit?: number;
//   search?: string;
// };

// const asObjectId = (v?: string) => (v ? new Types.ObjectId(v) : undefined);
// const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// export async function getEmployeeLeaveStatus(
//   employeeId: Types.ObjectId,
//   year = new Date().getFullYear()
// ) {
//   const [balances, apps] = await Promise.all([
//     EmployeeLeaveBalance.getForEmployeeYear(employeeId, year),
//     Application.find({
//       applicantId: employeeId,
//       isDeleted: false,
//       "leaveDetails.leaveTypeId": { $exists: true },
//     })
//       .select("currentStatus numberOfDays fromDate toDate leaveDetails applicationType")
//       .lean(),
//   ]);

//   const summary = {
//     byType: balances.map((b) => ({
//       leaveTypeId: b.leaveTypeId,
//       opening: b.openingBalance,
//       accrued: b.accrued,
//       used: b.used,
//       pending: b.pending,
//       carryForward: b.carryForward,
//       encashed: b.encashed,
//       available: b.openingBalance + b.accrued + b.carryForward - b.used - b.encashed - b.pending,
//     })),
//   };

//   return { balances, summary, applications: apps };
// }

// export async function getAllEmployeesLeaveStatus(query: AllEmployeesLeaveQuery) {
//   const year = query.year ?? new Date().getFullYear();
//   const page = Math.max(Number(query.page ?? 1), 1);
//   const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
//   const skip = (page - 1) * limit;

//   const empFilter: any = { isDeleted: false };
//   const orgId = asObjectId(query.orgId);
//   const depId = asObjectId(query.departmentId);
//   const desigId = asObjectId(query.designationId);

//   if (orgId) empFilter.orgId = orgId;
//   if (depId) empFilter["companyDetails.department.id"] = depId;
//   if (desigId) empFilter["companyDetails.designation.id"] = desigId;

//   if (query.search) {
//     const rx = new RegExp(escapeRegex(query.search), "i");
//     empFilter.$or = [
//       { "personalInfo.name.fullName": rx },
//       { "personalInfo.name.firstName": rx },
//       { "personalInfo.name.lastName": rx },
//       { "companyDetails.officialEmail": rx },
//     ];
//   }

//   const [employees, total] = await Promise.all([
//     Employee.find(empFilter)
//       .select({
//         _id: 1,
//         "personalInfo.name.fullName": 1,
//         "companyDetails.employeeId": 1,
//         "companyDetails.department.id": 1,
//         "companyDetails.designation.id": 1,
//         "companyDetails.officialEmail": 1,
//       })
//       .skip(skip)
//       .limit(limit)
//       .lean(),
//     Employee.countDocuments(empFilter),
//   ]);

//   const employeeIds = employees.map((e) => e._id);
//   if (employeeIds.length === 0) {
//     return { data: [], page, limit, total, totalPages: Math.ceil(total / limit) };
//   }

//   const balances = await EmployeeLeaveBalance.find({
//     employeeId: { $in: employeeIds },
//     year,
//   })
//     .populate("leaveTypeId", "name code isPaid")
//     .lean();

//   const byEmployee: Record<string, typeof balances> = {};
//   for (const b of balances) {
//     const key = String(b.employeeId);
//     if (!byEmployee[key]) byEmployee[key] = [];
//     byEmployee[key].push(b);
//   }

//   const apps = await Application.aggregate([
//     {
//       $match: {
//         applicantId: { $in: employeeIds },
//         isDeleted: false,
//         "leaveDetails.leaveTypeId": { $exists: true },
//         $expr: { $eq: [{ $year: "$fromDate" }, year] },
//       },
//     },
//     {
//       $group: {
//         _id: "$applicantId",
//         total: { $sum: 1 },
//         pending: { $sum: { $cond: [{ $eq: ["$currentStatus", "pending"] }, 1, 0] } },
//         approved: { $sum: { $cond: [{ $eq: ["$currentStatus", "approved"] }, 1, 0] } },
//         rejected: { $sum: { $cond: [{ $eq: ["$currentStatus", "rejected"] }, 1, 0] } },
//       },
//     },
//   ]);

//   const appByEmp: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {};
//   for (const a of apps) {
//     appByEmp[String(a._id)] = {
//       total: a.total,
//       pending: a.pending,
//       approved: a.approved,
//       rejected: a.rejected,
//     };
//   }

//   const data = employees.map((e) => {
//     const eId = String(e._id);
//     const rows = byEmployee[eId] ?? [];
//     const summary = rows.map((b) => ({
//       leaveTypeId: b.leaveTypeId,
//       opening: b.openingBalance,
//       accrued: b.accrued,
//       used: b.used,
//       pending: b.pending,
//       carryForward: b.carryForward,
//       encashed: b.encashed,
//       available: b.openingBalance + b.accrued + b.carryForward - b.used - b.encashed - b.pending,
//     }));

//     return {
//       employee: {
//         _id: e._id,
//         name: e.personalInfo?.name?.fullName,
//         employeeCode: e.companyDetails?.employeeId,
//         email: e.companyDetails?.officialEmail,
//         departmentId: e.companyDetails?.department?.id,
//         designationId: e.companyDetails?.designation?.id,
//       },
//       year,
//       balances: rows,
//       summary,
//       apps: appByEmp[eId] ?? { total: 0, pending: 0, approved: 0, rejected: 0 },
//     };
//   });

//   return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
// }

// export const LeaveStatusServices = {
//   getEmployeeLeaveStatus,
//   getAllEmployeesLeaveStatus,
// };
