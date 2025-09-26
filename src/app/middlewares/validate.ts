import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

type Source = "body" | "query" | "params";

/** Accept ANY Zod schema (object, union, discriminated union, effects, etc.) */
export const validate =
  (schema: ZodTypeAny, source: Source = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync((req as any)[source]);
      (req as any)[source] = parsed; // write back parsed & coerced data
      next();
    } catch (err: any) {
      const issues =
        err?.issues?.map((i: any) => ({
          path: i.path?.join("."),
          message: i.message,
          code: i.code,
        })) ?? [];
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: issues,
      });
    }
  };
