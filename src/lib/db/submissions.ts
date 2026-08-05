"use server";

import type { Json } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { opportunitySchema, type OpportunityInput } from "@/lib/validators/opportunity";
import type { AdminResult } from "@/lib/db/admin-actions";

export async function submitOpportunity(input: OpportunityInput): Promise<AdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "error", message: "Sign in to submit an opportunity." };

  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid", message: "Invalid listing data." };
  if (!parsed.data.source_url) {
    return { ok: false, reason: "invalid", message: "An official source URL is required." };
  }

  const { error } = await supabase.from("submissions").insert({
    submitter_id: user.id,
    target_type: "opportunity",
    payload: parsed.data as unknown as Json,
    status: "pending",
  });
  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true };
}
