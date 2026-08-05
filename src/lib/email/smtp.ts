import "server-only";
import nodemailer from "nodemailer";
import { serverEnv } from "@/lib/env.server";

const DAILY_QUOTA = serverEnv.SMTP_DAILY_QUOTA ?? 400;
const DEFAULT_FROM = serverEnv.SMTP_FROM_EMAIL ?? "SPARK <noreply@example.com>";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: serverEnv.SMTP_HOST,
      port: serverEnv.SMTP_PORT,
      secure: serverEnv.SMTP_PORT === 465,
      auth: {
        user: serverEnv.SMTP_USER,
        pass: serverEnv.SMTP_PASS,
      },
    });
  }
  return transporter;
}

let sentToday = 0;
let quotaDay = new Date().toISOString().slice(0, 10);

function trackSent() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== quotaDay) {
    sentToday = 0;
    quotaDay = today;
  }
  sentToday += 1;
}

export function remainingQuota(): number {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== quotaDay) {
    sentToday = 0;
    quotaDay = today;
  }
  return Math.max(0, DAILY_QUOTA - sentToday);
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (remainingQuota() < 1) {
    throw new Error(`Email daily quota (${DAILY_QUOTA}) reached.`);
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  if (recipients.length === 0) throw new Error("No recipients provided.");

  await getTransporter().sendMail({
    from: input.from ?? DEFAULT_FROM,
    to: recipients[0],
    bcc: recipients.slice(1),
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  trackSent();
}
