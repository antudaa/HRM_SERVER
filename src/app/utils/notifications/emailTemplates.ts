// // src/utils/notifications/emailTemplates.ts
// const APP_URL = process.env.APP_URL || "http://localhost:3000";
// const BRAND = process.env.HRM_NAME || "HRM";

// const appLink = (appId: string) => `${APP_URL}/applications/${appId}`;

// export const EmailTpl = {
//     toApprover_new(appId: string, applicantName?: string, title?: string) {
//         const subject = `[${BRAND}] New Application to Review`;
//         const html = `
//       <h2>New Application Requires Your Review</h2>
//       <p><b>Applicant:</b> ${applicantName ?? "Employee"}</p>
//       <p><b>Title:</b> ${title ?? "-"}</p>
//       <p>Please open the request and take an action.</p>
//       <p><a href="${appLink(appId)}" target="_blank">Open Application</a></p>
//     `;
//         return { subject, html, text: `${subject}\n${appLink(appId)}` };
//     },

//     toApprover_forwarded(appId: string, fromApproverName?: string, title?: string) {
//         const subject = `[${BRAND}] Application forwarded to you`;
//         const html = `
//       <h2>Application moved to your stage</h2>
//       <p><b>Forwarded by:</b> ${fromApproverName ?? "Approver"}</p>
//       <p><b>Title:</b> ${title ?? "-"}</p>
//       <p><a href="${appLink(appId)}" target="_blank">Open Application</a></p>
//     `;
//         return { subject, html, text: `${subject}\n${appLink(appId)}` };
//     },

//     toApplicant_approved(appId: string, title?: string) {
//         const subject = `[${BRAND}] Your application is approved`;
//         const html = `
//       <h2>Approved ✅</h2>
//       <p>Your application <b>${title ?? "-"}</b> has been approved.</p>
//       <p><a href="${appLink(appId)}" target="_blank">View details</a></p>
//     `;
//         return { subject, html, text: `${subject}\n${appLink(appId)}` };
//     },

//     toApplicant_rejected(appId: string, title?: string, reason?: string) {
//         const subject = `[${BRAND}] Your application is rejected`;
//         const html = `
//       <h2>Rejected ❌</h2>
//       <p>Your application <b>${title ?? "-"}</b> was rejected.</p>
//       ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}
//       <p><a href="${appLink(appId)}" target="_blank">View details</a></p>
//     `;
//         return { subject, html, text: `${subject}\nReason: ${reason ?? "-"}\n${appLink(appId)}` };
//     },

//     toApplicant_cancelled(appId: string, title?: string, reason?: string) {
//         const subject = `[${BRAND}] Your application was cancelled`;
//         const html = `
//       <h2>Cancelled</h2>
//       <p>Your application <b>${title ?? "-"}</b> has been cancelled.</p>
//       ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}
//       <p><a href="${appLink(appId)}" target="_blank">View details</a></p>
//     `;
//         return { subject, html, text: `${subject}\nReason: ${reason ?? "-"}\n${appLink(appId)}` };
//     },

//     toApplicant_commented(appId: string, title?: string, message?: string) {
//         const subject = `[${BRAND}] New comment on your application`;
//         const html = `
//       <h2>New Comment</h2>
//       <p><b>Application:</b> ${title ?? "-"}</p>
//       ${message ? `<p><i>${message}</i></p>` : ""}
//       <p><a href="${appLink(appId)}" target="_blank">Reply in thread</a></p>
//     `;
//         return { subject, html, text: `${subject}\n${message ?? ""}\n${appLink(appId)}` };
//     },
// };




// src/utils/notifications/emailTemplates.ts
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const BRAND = process.env.HRM_NAME || "HRM";
const LOGO = process.env.HRM_LOGO_URL || ""; // <-- add this optional env

const appLink = (appId: string) => `${APP_URL}/applications/${appId}`;

const baseHtml = (title: string, inner: string) => `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f6f8fb;padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeef6;">
      <tr>
        <td style="background:#0f172a;padding:16px 20px;">
          <div style="display:flex;align-items:center;gap:12px;color:#fff;">
            ${LOGO ? `<img src="${LOGO}" alt="${BRAND}" style="height:28px;border-radius:6px" />` : ""}
            <strong style="font-size:16px;letter-spacing:.3px">${BRAND}</strong>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 24px 8px 24px;">
          <h2 style="margin:0 0 12px 0;color:#111827;font-size:18px;">${title}</h2>
          <div style="color:#374151;line-height:1.6;font-size:14px">${inner}</div>
          <p style="margin:18px 0 6px">
            <a href="#" style="pointer-events:none;color:#9ca3af;text-decoration:none;font-size:12px">This is an automated message from ${BRAND}.</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 24px;background:#f8fafc;color:#6b7280;font-size:12px">
          © ${new Date().getFullYear()} ${BRAND}. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
`;

const button = (href: string, label = "Open") => `
  <p style="margin:16px 0 0">
    <a href="${href}" target="_blank" style="display:inline-block;padding:10px 16px;border-radius:8px;border:1px solid #111827;background:#111827;color:#fff;text-decoration:none;font-weight:600;">
      ${label}
    </a>
  </p>
`;

export const EmailTpl = {
  toApprover_new(appId: string, applicantName?: string, title?: string) {
    const subject = `[${BRAND}] New Application to Review`;
    const html = baseHtml(
      "New Application Requires Your Review",
      `
        <p><b>Applicant:</b> ${applicantName ?? "Employee"}</p>
        <p><b>Title:</b> ${title ?? "-"}</p>
        <p>Please open the request and take an action.</p>
        ${button(appLink(appId), "Open Application")}
      `
    );
    return { subject, html, text: `${subject}\n${appLink(appId)}` };
  },

  toApprover_forwarded(appId: string, fromApproverName?: string, title?: string) {
    const subject = `[${BRAND}] Application forwarded to you`;
    const html = baseHtml(
      "Application moved to your stage",
      `
        <p><b>Forwarded by:</b> ${fromApproverName ?? "Approver"}</p>
        <p><b>Title:</b> ${title ?? "-"}</p>
        ${button(appLink(appId), "Open Application")}
      `
    );
    return { subject, html, text: `${subject}\n${appLink(appId)}` };
  },

  toApplicant_approved(appId: string, title?: string) {
    const subject = `[${BRAND}] Your application is approved`;
    const html = baseHtml(
      "Approved ✅",
      `
        <p>Your application <b>${title ?? "-"}</b> has been approved.</p>
        ${button(appLink(appId), "View details")}
      `
    );
    return { subject, html, text: `${subject}\n${appLink(appId)}` };
  },

  toApplicant_rejected(appId: string, title?: string, reason?: string) {
    const subject = `[${BRAND}] Your application is rejected`;
    const html = baseHtml(
      "Rejected ❌",
      `
        <p>Your application <b>${title ?? "-"}</b> was rejected.</p>
        ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}
        ${button(appLink(appId), "View details")}
      `
    );
    return { subject, html, text: `${subject}\nReason: ${reason ?? "-"}\n${appLink(appId)}` };
  },

  toApplicant_cancelled(appId: string, title?: string, reason?: string) {
    const subject = `[${BRAND}] Your application was cancelled`;
    const html = baseHtml(
      "Cancelled",
      `
        <p>Your application <b>${title ?? "-"}</b> has been cancelled.</p>
        ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}
        ${button(appLink(appId), "View details")}
      `
    );
    return { subject, html, text: `${subject}\nReason: ${reason ?? "-"}\n${appLink(appId)}` };
  },

  toApplicant_commented(appId: string, title?: string, message?: string) {
    const subject = `[${BRAND}] New comment on your application`;
    const html = baseHtml(
      "New Comment",
      `
        <p><b>Application:</b> ${title ?? "-"}</p>
        ${message ? `<p style="white-space:pre-line"><i>${message}</i></p>` : ""}
        ${button(appLink(appId), "Reply in thread")}
      `
    );
    return { subject, html, text: `${subject}\n${message ?? ""}\n${appLink(appId)}` };
  },
};
