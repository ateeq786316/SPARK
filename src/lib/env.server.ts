import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM_EMAIL: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^[^<]*<[^@\s]+@[^@\s]+\.[^@\s]+>$/.test(value) ||
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      "Must be an email address or \"Name <email@domain.com>\""
    ),
  SMTP_DAILY_QUOTA: z.coerce.number().int().positive().optional(),
});

const parsed = serverEnvSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  SMTP_DAILY_QUOTA: process.env.SMTP_DAILY_QUOTA ?? "400",
});

if (!parsed.success) {
  throw new Error(
    `Invalid server environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
  );
}

export const serverEnv = parsed.data;
