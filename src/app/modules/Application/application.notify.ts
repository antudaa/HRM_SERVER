// src/modules/Application/application.notify.ts
import { Types } from "mongoose";
import { sendMail } from "../../utils/mailer";
import { EmailTpl } from "../../utils/notifications/emailTemplates";
import { Employee } from "../Employee/employee.model";
import { TGeneralApplication } from "./application.interface";

type IdLike = string | Types.ObjectId;

async function getEmailsAndNames(ids: IdLike[]) {
  const objIds = ids.map((id) => new Types.ObjectId(id));
  const employees = await Employee.find({ _id: { $in: objIds } })
    .select("_id companyDetails.officialEmail personalInfo.name.fullName")
    .lean();

  const emailById: Record<string, string | undefined> = {};
  const nameById: Record<string, string | undefined> = {};

  for (const e of employees) {
    const key = String((e as any)?._id);
    emailById[key] = (e as any)?.companyDetails?.officialEmail;
    nameById[key] = (e as any)?.personalInfo?.name?.fullName;
  }
  return { emailById, nameById };
}

export const ApplicationNotifier = {
  /** Notify the very first approver when an application is created */
  async notifyFirstApprover(app: TGeneralApplication & { _id: Types.ObjectId }) {
    const first = app.approvers?.[0];
    if (!first) return;

    const applicantId = String(app.applicantId);
    const approverId = String(first.approverId);

    const { emailById, nameById } = await getEmailsAndNames([applicantId, approverId]);

    const to = emailById[approverId];
    if (!to) return;

    const applicantName = nameById[applicantId];

    const { subject, html, text } = EmailTpl.toApprover_new(String(app._id), applicantName, app.title);
    await sendMail({ to, subject, html, text });
  },

  /**
   * Notify the next approver when the current approver approves and the app is forwarded.
   * Expects `app.currentApproverIndex` to have already advanced to the *next* stage.
   */
  async notifyNextApprover(
    app: TGeneralApplication & { _id: Types.ObjectId },
    fromApproverId: Types.ObjectId
  ) {
    const idx = app.currentApproverIndex ?? 0;
    const next = app.approvers?.[idx];
    if (!next) return;

    const nextId = String(next.approverId);
    const fromId = String(fromApproverId);

    const { emailById, nameById } = await getEmailsAndNames([nextId, fromId]);

    const to = emailById[nextId];
    if (!to) return;

    const fromName = nameById[fromId];

    const { subject, html, text } = EmailTpl.toApprover_forwarded(String(app._id), fromName, app.title);
    await sendMail({ to, subject, html, text });
  },

  /** Notify the applicant on final approval */
  async notifyApplicantApproved(app: TGeneralApplication & { _id: Types.ObjectId }) {
    const applicantId = String(app.applicantId);
    const { emailById } = await getEmailsAndNames([applicantId]);

    const to = emailById[applicantId];
    if (!to) return;

    const { subject, html, text } = EmailTpl.toApplicant_approved(String(app._id), app.title);
    await sendMail({ to, subject, html, text });
  },

  /** Notify the applicant if the application is rejected (include reason when provided) */
  async notifyApplicantRejected(
    app: TGeneralApplication & { _id: Types.ObjectId },
    reason?: string
  ) {
    const applicantId = String(app.applicantId);
    const { emailById } = await getEmailsAndNames([applicantId]);

    const to = emailById[applicantId];
    if (!to) return;

    const { subject, html, text } = EmailTpl.toApplicant_rejected(String(app._id), app.title, reason);
    await sendMail({ to, subject, html, text });
  },

  /** Notify the applicant if the application is cancelled */
  async notifyApplicantCancelled(
    app: TGeneralApplication & { _id: Types.ObjectId },
    reason?: string
  ) {
    const applicantId = String(app.applicantId);
    const { emailById } = await getEmailsAndNames([applicantId]);

    const to = emailById[applicantId];
    if (!to) return;

    const { subject, html, text } = EmailTpl.toApplicant_cancelled(String(app._id), app.title, reason);
    await sendMail({ to, subject, html, text });
  },

  /** Notify the applicant when an approver leaves a comment */
  async notifyApplicantCommented(
    app: TGeneralApplication & { _id: Types.ObjectId },
    message?: string
  ) {
    const applicantId = String(app.applicantId);
    const { emailById } = await getEmailsAndNames([applicantId]);

    const to = emailById[applicantId];
    if (!to) return;

    const { subject, html, text } = EmailTpl.toApplicant_commented(String(app._id), app.title, message);
    await sendMail({ to, subject, html, text });
  },
};
