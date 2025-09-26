// src/app/modules/holiday/holiday.service.ts
import httpStatus from "http-status";
import AppError from "../../Errors/AppError";
import { Holiday } from "./holiday.model";
import { THoliday } from "./holiday.interface";

/** Ensure start <= end and default end=start when missing */
const normalizeDates = (startDate: string, endDate?: string) => {
  const s = startDate;
  const e = endDate && endDate.length ? endDate : startDate;
  if (s > e) throw new AppError(httpStatus.BAD_REQUEST, "startDate cannot be after endDate");
  return { s, e };
};

/** Optional overlap check within active holidays */
const assertNoActiveOverlap = async (
  name: string,
  start: string,
  end: string,
  excludeId?: string,
  allowOverlap?: boolean
) => {
  if (allowOverlap) return; // explicitly allow
  const q: any = {
    isDeleted: false,
    startDate: { $lte: end },
    $or: [{ endDate: { $gte: start } }, { endDate: { $exists: false } }],
  };
  if (excludeId) q._id = { $ne: excludeId };
  const overlaps = await Holiday.find(q).limit(1);
  if (overlaps.length) {
    // Business rule: block overlaps by default
    throw new AppError(httpStatus.CONFLICT, "Holiday period overlaps an existing holiday");
  }
};

const createHoliday = async (payload: {
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  allowOverlap?: boolean;
}): Promise<THoliday> => {
  const { s, e } = normalizeDates(payload.startDate, payload.endDate);
  await assertNoActiveOverlap(payload.name, s, e, undefined, payload.allowOverlap);
  const doc = await Holiday.create({
    name: payload.name.trim(),
    startDate: s,
    endDate: e,
    description: payload.description ?? "",
    isDeleted: false,
  });
  return doc.toObject();
};

const listHolidays = async () => {
  return Holiday.find().sort({ startDate: 1, name: 1 });
};

const listActiveHolidays = async () => {
  return Holiday.getActive();
};

const getHolidayById = async (id: string) => {
  const doc = await Holiday.findById(id);
  if (!doc) throw new AppError(httpStatus.NOT_FOUND, "Holiday not found");
  return doc;
};

const updateHoliday = async (id: string, payload: Partial<THoliday> & { allowOverlap?: boolean }) => {
  if (payload.startDate || payload.endDate) {
    const { s, e } = normalizeDates(payload.startDate || "", payload.endDate);
    await assertNoActiveOverlap(payload.name || "", s, e, id, payload.allowOverlap);
    payload.startDate = s;
    payload.endDate = e;
  }
  const updated = await Holiday.findByIdAndUpdate(
    id,
    { $set: { ...payload } },
    { new: true }
  );
  if (!updated) throw new AppError(httpStatus.NOT_FOUND, "Holiday not found");
  return updated;
};

const softDeleteHoliday = async (id: string) => {
  const updated = await Holiday.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!updated) throw new AppError(httpStatus.NOT_FOUND, "Holiday not found");
  return { ok: true };
};

const hardDeleteHoliday = async (id: string) => {
  const res = await Holiday.findByIdAndDelete(id);
  if (!res) throw new AppError(httpStatus.NOT_FOUND, "Holiday not found");
  return { ok: true };
};

const getHolidaysByRange = async (start: string, end: string) => {
  const { s, e } = normalizeDates(start, end);
  return Holiday.getByRange(s, e);
};

/** Bulk create from JSON array; continues on errors and returns summary */
const bulkCreateHolidays = async (rows: Array<{ name: string; startDate: string; endDate?: string; description?: string }>, allowOverlap = false) => {
  const results: Array<{
    index: number;
    success: boolean;
    data?: THoliday;
    error?: string;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const { s, e } = normalizeDates(r.startDate, r.endDate);
      await assertNoActiveOverlap(r.name, s, e, undefined, allowOverlap);
      const doc = await Holiday.create({
        name: (r.name || "").trim(),
        startDate: s,
        endDate: e,
        description: r.description ?? "",
        isDeleted: false,
      });
      results.push({ index: i, success: true, data: doc.toObject() });
    } catch (err: any) {
      results.push({ index: i, success: false, error: err?.message || "Unknown error" });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;

  return { successCount, failCount, results };
};

export const HolidayServices = {
  createHoliday,
  listHolidays,
  listActiveHolidays,
  getHolidayById,
  updateHoliday,
  softDeleteHoliday,
  hardDeleteHoliday,
  getHolidaysByRange,
  bulkCreateHolidays,
};
