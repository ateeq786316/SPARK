"use server";

import { requireAdmin } from "@/lib/db/admin-actions";
import { uploadImage } from "@/lib/storage";

export async function uploadAdminImage(file: File, folder: string): Promise<string> {
  await requireAdmin();
  return uploadImage(file, folder);
}
