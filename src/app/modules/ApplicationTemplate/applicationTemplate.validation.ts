import { z } from "zod";
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const TemplateApproverRaw = z.object({
  employeeId: objectId.optional(),
  role: z.string().optional(),
  commentsRequired: z.boolean().optional(),
  dueAfterDays: z.number().int().nonnegative().optional(),
});

// 👇 Optional array, and we filter out empty rows so the user isn’t forced to provide any
const TemplateApprovers = z
  .array(TemplateApproverRaw)
  .optional()
  .transform((arr) =>
    (arr ?? []).filter((a) => a.employeeId || (a.role && a.role.trim()))
  );

export const CreateTemplateSchema = z.object({
  orgId: objectId.optional(),
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  applicationType: z.enum([
    "leave",
    "adjustment",
    "business_trip",
    "business_trip_report",
    "refund",
    "resignation",
    "home_office",
    "data_update",
  ]),
  titleTemplate: z.string().optional(),
  bodyTemplate: z.string().min(1),
  variables: z.array(z.string()).optional(),
  defaultApprovers: TemplateApprovers, // <-- optional & cleaned
  active: z.boolean().optional(),
});

export const UpdateTemplateSchema = CreateTemplateSchema.partial();

export const RenderTemplateSchema = z.object({
  variables: z.record(z.any()).default({}),
});
