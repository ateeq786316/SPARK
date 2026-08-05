"use server";

import { requireAdmin } from "@/lib/db/admin-actions";
import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/storage";

export async function uploadAdminImage(file: File, folder: string): Promise<string> {
  await requireAdmin();
  return uploadImage(file, folder);
}

export async function uploadPublicImage(file: File, folder: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload images.");
  return uploadImage(file, folder);
}
