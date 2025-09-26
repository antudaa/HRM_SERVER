import nodemailer from "nodemailer";

export type MailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(input: MailInput) {
  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
    return await transporter.sendMail({ from, ...input });
  } catch (err: any) {
    err.debug = { code: err.code, command: err.command, response: err.response };
    throw err;
  }
}
