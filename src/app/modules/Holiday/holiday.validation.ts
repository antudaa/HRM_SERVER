import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const createHolidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  startDate: isoDate,
  endDate: isoDate.optional(),
  description: z.string().optional().default(""),
});

export const updateHolidaySchema = z.object({
  name: z.string().min(1).optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  description: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const rangeQuerySchema = z.object({
  start: isoDate,
  end: isoDate,
});

export const bulkHolidaysSchema = z.object({
  holidays: z.array(createHolidaySchema).min(1, "At least one holiday required"),
  allowOverlap: z.boolean().optional().default(false),
});
