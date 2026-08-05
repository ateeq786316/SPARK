import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const admin = createAdminClient();
  const ext = (file.name.split(".").pop() ?? "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await admin.storage.from("images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw new Error(error.message);

  const { data } = admin.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}
