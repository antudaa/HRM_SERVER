// src/app/modules/Leave/leave.superAdmin.controller.ts
import { RequestHandler } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

import { EmployeeLeaveBalance } from "./employeeLeaveBalance.model";
import { LeaveType } from "./leaveManagement.model";

// Adjust this import path to your actual Employee model
import { Employee } from "../Employee/employee.model";

/* -------------------------------------------------------------------------- */
/*                               Admin: Adjust                                */
/* -------------------------------------------------------------------------- */

const adminAdjustBalance: RequestHandler = async (req, res) => {
  try {
    const { employeeId, leaveTypeId, year, days, note } = req.body as {
      employeeId: string;
      leaveTypeId: string;
      year: number;
      days: number;
      note?: string;
    };

    if (!employeeId || !leaveTypeId || !year || typeof days !== "number") {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "employeeId, leaveTypeId, year, days are required",
        data: null,
      });
    }

    await EmployeeLeaveBalance.postLedgerAndRecompute({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      year,
      type: "ADJUSTMENT",
      days,
      note: note ?? "Admin adjustment (opening/grant)",
    });

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Balance adjusted and recomputed.",
      data: { employeeId, leaveTypeId, year, days },
    });
  } catch (e: any) {
    return sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: e?.message ?? "Failed to adjust balance",
      data: null,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                               Helper: meta                                 */
/* -------------------------------------------------------------------------- */

async function getEmployeeMeta(empId: Types.ObjectId) {
  try {
    // Select the *actual* nested fields your schema exposes:
    // personalInfo.name.{firstName,lastName,fullName} and companyDetails.employeeId
    const doc = await Employee.findById(empId)
      .select(
        "_id personalInfo.name.firstName personalInfo.name.lastName personalInfo.name.fullName companyDetails.employeeId"
      )
      .lean();

    if (!doc) return undefined;

    // Use `any` to avoid TS complaining about deep optional paths from mongoose's FlattenMaps
    const d: any = doc;

    const first = d?.personalInfo?.name?.firstName;
    const last = d?.personalInfo?.name?.lastName;
    const full = d?.personalInfo?.name?.fullName;
    const name: string | undefined = full || [first, last].filter(Boolean).join(" ") || undefined;

    // Your company details field is called employeeId (string/number code), not employeeCode
    const employeeCode: string | undefined = d?.companyDetails?.employeeId;

    return {
      _id: String(d?._id),
      name,
      employeeCode,
    };
  } catch {
    return undefined;
  }
}

/* -------------------------------------------------------------------------- */
/*                               GET Balances                                 */
/* -------------------------------------------------------------------------- */

export const getLeaveBalances: RequestHandler = catchAsync(async (req, res) => {
  const employeeId = String(req.query.employeeId || "").trim();
  const year = Number(req.query.year || new Date().getFullYear());

  if (!employeeId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "employeeId is required",
      data: null,
    });
  }

  const emp = new Types.ObjectId(employeeId);

  const rows = await EmployeeLeaveBalance.getForEmployeeYear(emp, year);

  const typeIds = Array.from(
    new Set(rows.map((r: any) => String(r.leaveTypeId)).filter(Boolean))
  ).map((id) => new Types.ObjectId(id));

  const types = typeIds.length
    ? await LeaveType.find({ _id: { $in: typeIds } })
        .select("_id name code shortCode displayName")
        .lean()
    : [];

  const typeMap = new Map(
    types.map((t: any) => [
      String(t._id),
      {
        name: t.displayName || t.name || t.code || String(t._id),
        code: t.code || t.shortCode,
      },
    ])
  );

  const empMeta = await getEmployeeMeta(emp);

  const enriched = rows.map((r: any) => {
    const key = String(r.leaveTypeId);
    const meta = typeMap.get(key);

    const opening = r.openingBalance ?? 0;
    const accrued = r.accrued ?? 0;
    const carry = r.carryForward ?? 0;
    const used = r.used ?? 0;
    const encashed = r.encashed ?? 0;
    const pending = r.pending ?? 0;

    const capacity = opening + accrued + carry;
    const available = Math.max(0, capacity - (used + encashed + pending));

    return {
      ...r,
      employeeId: String(r.employeeId ?? emp),
      leaveTypeId: String(r.leaveTypeId),
      leaveTypeName: meta?.name,
      leaveTypeCode: meta?.code,
      employeeName: empMeta?.name,
      employeeCode: empMeta?.employeeCode,
      available,
    };
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leave balances fetched.",
    data: enriched,
  });
});

/* -------------------------------------------------------------------------- */
/*                                GET Ledger                                  */
/* -------------------------------------------------------------------------- */

export const getLeaveLedger: RequestHandler = catchAsync(async (req, res) => {
  const employeeId = String(req.query.employeeId || "").trim();
  const year = Number(req.query.year || new Date().getFullYear());
  const leaveTypeIdRaw = (req.query.leaveTypeId as string | undefined)?.trim();

  if (!employeeId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "employeeId is required",
      data: null,
    });
  }

  const emp = new Types.ObjectId(employeeId);
  const leaveTypeId = leaveTypeIdRaw ? new Types.ObjectId(leaveTypeIdRaw) : undefined;

  const anyModel = EmployeeLeaveBalance as any;

  let rows: any[] = [];
  if (typeof anyModel.getLedgerForEmployeeYear === "function") {
    rows = await anyModel.getLedgerForEmployeeYear(emp, year, leaveTypeId);
  } else if (typeof anyModel.getLedger === "function") {
    rows = await anyModel.getLedger(emp, { year, leaveTypeId });
  } else {
    rows = [];
  }

  const typeIds = Array.from(
    new Set(rows.map((r: any) => String(r.leaveTypeId)).filter(Boolean))
  ).map((id) => new Types.ObjectId(id));

  const types = typeIds.length
    ? await LeaveType.find({ _id: { $in: typeIds } })
        .select("_id name code shortCode displayName")
        .lean()
    : [];

  const typeMap = new Map(
    types.map((t: any) => [
      String(t._id),
      {
        name: t.displayName || t.name || t.code || String(t._id),
        code: t.code || t.shortCode,
      },
    ])
  );

  const empMeta = await getEmployeeMeta(emp);

  const enriched = rows.map((r: any) => {
    const key = String(r.leaveTypeId);
    const meta = typeMap.get(key);
    return {
      ...r,
      employeeId: String(r.employeeId ?? emp),
      leaveTypeId: String(r.leaveTypeId),
      leaveTypeName: meta?.name,
      leaveTypeCode: meta?.code,
      employeeName: empMeta?.name,
      employeeCode: empMeta?.employeeCode,
    };
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leave ledger fetched.",
    data: enriched,
  });
});

export const LeaveControllers = {
  adminAdjustBalance,
  getLeaveBalances,
  getLeaveLedger,
};
