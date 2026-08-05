"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSave(
  opportunityId: string
): Promise<{ saved: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to save opportunities.");

  const { data: existing } = await supabase
    .from("saved_items")
    .select("opportunity_id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunityId);
    if (error) throw new Error(error.message);
    revalidatePath("/saved");
    return { saved: false };
  }

  const { error } = await supabase
    .from("saved_items")
    .insert({ user_id: user.id, opportunity_id: opportunityId });
  if (error) throw new Error(error.message);
  revalidatePath("/saved");
  return { saved: true };
}
