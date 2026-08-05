"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markApplied(
  opportunityId: string,
  notes: string | null = null
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to track applications.");

  const { error } = await supabase
    .from("application_records")
    .upsert(
      { user_id: user.id, opportunity_id: opportunityId, notes },
      { onConflict: "user_id,opportunity_id" }
    );
  if (error) throw new Error(error.message);
  revalidatePath("/applied");
}

export async function removeApplied(opportunityId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to track applications.");

  const { error } = await supabase
    .from("application_records")
    .delete()
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId);
  if (error) throw new Error(error.message);
  revalidatePath("/applied");
}
