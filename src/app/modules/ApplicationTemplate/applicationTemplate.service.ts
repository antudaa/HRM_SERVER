import { Types } from "mongoose";
import { ApplicationTemplate } from "./applicationTemplate.model";
import { TApplicationTemplate } from "./applicationTemplate.interface";

/** super-simple {{path.to.value}} renderer (safe, no code exec) */
function renderString(tpl: string, vars: Record<string, any>) {
  return tpl.replace(/{{\s*([\w.[\]$]+)\s*}}/g, (_, path: string) => {
    const parts = path.split(".");
    let cur: any = vars;
    for (const p of parts) cur = cur?.[p];
    return (cur ?? "").toString();
  });
}

export async function createTemplate(payload: TApplicationTemplate, userId?: string) {
  return ApplicationTemplate.create({
    ...payload,
    createdBy: userId ? new Types.ObjectId(userId) : undefined,
  });
}

export async function updateTemplate(id: string, payload: Partial<TApplicationTemplate>, userId?: string) {
  return ApplicationTemplate.findByIdAndUpdate(
    id,
    { ...payload, updatedBy: userId ? new Types.ObjectId(userId) : undefined },
    { new: true }
  );
}

export async function listTemplates(query: any = {}) {
  const { orgId, applicationType, active } = query;
  const q: any = {};
  if (orgId) q.orgId = new Types.ObjectId(orgId);
  if (applicationType) q.applicationType = applicationType;
  if (active !== undefined) q.active = active === "true";
  return ApplicationTemplate.find(q).sort({ createdAt: -1 });
}

export async function getTemplateById(id: string) {
  return ApplicationTemplate.findById(id);
}

export async function getActiveByType(orgId: string | undefined, applicationType: TApplicationTemplate["applicationType"]) {
  return ApplicationTemplate.getActiveByType(orgId ? new Types.ObjectId(orgId) : undefined, applicationType);
}

export async function renderTemplate(id: string, variables: Record<string, any>) {
  const tpl = await ApplicationTemplate.findById(id).lean();
  if (!tpl || !tpl.active) throw new Error("Template not found or inactive");
  const title = tpl.titleTemplate ? renderString(tpl.titleTemplate, variables) : undefined;
  const body = renderString(tpl.bodyTemplate, variables);
  return { title, body, template: tpl };
}

export const ApplicationTemplateServices = {
  createTemplate,
  updateTemplate,
  listTemplates,
  getTemplateById,
  getActiveByType,
  renderTemplate,
};
