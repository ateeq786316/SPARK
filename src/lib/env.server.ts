import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
});

const parsed = serverEnvSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
});

if (!parsed.success) {
  throw new Error(
    `Invalid server environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
  );
}

export const serverEnv = parsed.data;
