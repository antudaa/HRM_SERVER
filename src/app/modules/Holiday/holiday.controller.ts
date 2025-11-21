import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { HolidayServices } from "./holiday.service";
import { createHolidaySchema, updateHolidaySchema, rangeQuerySchema, bulkHolidaysSchema } from "./holiday.validation";
import { buildHolidayTemplate, parseHolidaySheetToJson } from "./holiday.excel";

/** POST /holiday  */
const createHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = createHolidaySchema.safeParse(req.body);
    if (!parse.success) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: parse.error.errors.map(e => e.message).join(", "),
      });
    }
    const doc = await HolidayServices.createHoliday({ ...parse.data, allowOverlap: false });
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Holiday created",
      data: doc,
    });
  } catch (e) {
    next(e);
  }
};

/** GET /holiday */
const listHolidays = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await HolidayServices.listHolidays();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All holidays",
      data: rows,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

/** GET /holiday/active */
const listActive = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await HolidayServices.listActiveHolidays();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active holidays",
      data: rows,
    });
  } catch (e) {
    next(e);
  }
};

/** GET /holiday/range?start=YYYY-MM-DD&end=YYYY-MM-DD */
const getByRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const start = (req.query.start as string) ?? "";
    const end = (req.query.end as string) ?? "";
    const parse = rangeQuerySchema.safeParse({ start, end });
    if (!parse.success) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: parse.error.errors.map(e => e.message).join(", "),
      });
    }
    const rows = await HolidayServices.getHolidaysByRange(parse.data.start, parse.data.end);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Holidays overlapping ${parse.data.start} to ${parse.data.end}`,
      data: rows,
    });
  } catch (e) {
    next(e);
  }
};

/** GET /holiday/:id */
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await HolidayServices.getHolidayById(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Holiday",
      data: row,
    });
  } catch (e) {
    next(e);
  }
};

/** PATCH /holiday/:id */
const updateHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = updateHolidaySchema.safeParse(req.body);
    if (!parse.success) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: parse.error.errors.map(e => e.message).join(", "),
      });
    }
    const row = await HolidayServices.updateHoliday(req.params.id, { ...parse.data, allowOverlap: false });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Holiday updated",
      data: row,
    });
  } catch (e) {
    next(e);
  }
};

/** DELETE /holiday/:id (soft) */
const softDeleteHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await HolidayServices.softDeleteHoliday(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Holiday deleted (soft)",
      data: row,
    });
  } catch (e) {
    next(e);
  }
};

/** DELETE /holiday/:id/hard (optional) */
const hardDeleteHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await HolidayServices.hardDeleteHoliday(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Holiday permanently deleted",
      data: row,
    });
  } catch (e) {
    next(e);
  }
};

/** GET /holiday/template (Excel) */
const downloadTemplate = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buf = buildHolidayTemplate();
    const filename = `holiday_template.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(buf);
  } catch (e) {
    next(e);
  }
};

/** POST /holiday/bulk (JSON) */
const bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = bulkHolidaysSchema.safeParse(req.body);
    if (!parse.success) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: parse.error.errors.map(e => e.message).join(", "),
      });
    }
    const { holidays, allowOverlap } = parse.data;
    const summary = await HolidayServices.bulkCreateHolidays(holidays, allowOverlap);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Bulk create finished: ${summary.successCount} success, ${summary.failCount} failed`,
      data: summary,
    });
  } catch (e) {
    next(e);
  }
};

/** POST /holiday/bulk-upload (Excel/CSV file) */
const bulkUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // file is attached by multer as req.file
    if (!req.file?.buffer) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "No file uploaded",
      });
    }
    const allowOverlap = req.query.allowOverlap === "true";
    const rows = parseHolidaySheetToJson(req.file.buffer);

    // validate each row using createHolidaySchema to surface row-level errors nicely
    const validRows: Array<{ name: string; startDate: string; endDate?: string; description?: string }> = [];
    const invalids: Array<{ index: number; error: string }> = [];

    rows.forEach((row, idx) => {
      const parse = createHolidaySchema.safeParse(row);
      if (parse.success) {
        validRows.push(parse.data);
      } else {
        invalids.push({
          index: idx,
          error: parse.error.errors.map(e => e.message).join(", "),
        });
      }
    });

    const summary = await HolidayServices.bulkCreateHolidays(validRows, allowOverlap);
    // merge invalids into results
    const merged = [
      ...summary.results,
      ...invalids.map(i => ({ index: i.index, success: false, error: i.error })),
    ].sort((a, b) => a.index - b.index);

    const successCount = merged.filter(r => r.success).length;
    const failCount = merged.length - successCount;

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Bulk upload finished: ${successCount} success, ${failCount} failed`,
      data: { successCount, failCount, results: merged },
    });
  } catch (e) {
    next(e);
  }
};

export const HolidayControllers = {
  createHoliday,
  listHolidays,
  listActive,
  getByRange,
  getById,
  updateHoliday,
  softDeleteHoliday,
  hardDeleteHoliday,
  downloadTemplate,
  bulkCreate,
  bulkUpload,
};
