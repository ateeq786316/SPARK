"use server";

import { revalidatePath } from "next/cache";
import type { Json } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export interface NotificationSettings {
  deadline_reminders: boolean;
  new_matches: boolean;
  digest: boolean;
  newsletter: boolean;
}

export interface ProfileUpdate {
  fullName?: string;
  headline?: string;
  country?: string;
  interests?: string[];
  newsletterOptIn?: boolean;
  notificationSettings?: NotificationSettings;
}

export async function updateProfile(input: ProfileUpdate): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to update your profile.");

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(input.fullName !== undefined && { full_name: input.fullName }),
      ...(input.headline !== undefined && { headline: input.headline }),
      ...(input.country !== undefined && { country: input.country }),
      ...(input.interests !== undefined && { interests: input.interests }),
      ...(input.newsletterOptIn !== undefined && {
        newsletter_opt_in: input.newsletterOptIn,
      }),
      ...(input.notificationSettings !== undefined && {
        notification_settings: input.notificationSettings as unknown as Json,
      }),
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
