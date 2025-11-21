import { Types } from "mongoose";

export type WorkShiftLite = {
  shiftStarts?: string;
  shiftEnds?: string;
  shiftStartsDate?: string | Date;
  shiftEndsDate?: string | Date;
};

export const isObjectId = (v: unknown): v is Types.ObjectId =>
  v instanceof Types.ObjectId || (typeof v === "object" && v !== null && (v as any)._bsontype === "ObjectID");

/** Safely return the populated runningWorkShift (or null if still ObjectId) */
export function getRunningShift(doc: any): WorkShiftLite | null {
  const rw = doc?.companyDetails?.runningWorkShift;
  if (!rw) return null;
  if (isObjectId(rw)) return null;
  if (typeof rw === "object") return rw as WorkShiftLite;
  return null;
}

/** ISO date 'YYYY-MM-DD' */
export const toISODate = (d: Date) => d.toISOString().slice(0, 10);
