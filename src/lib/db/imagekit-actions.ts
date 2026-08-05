"use server";

import { requireAdmin } from "@/lib/db/admin-actions";
import { listImagekitFiles, deleteImagekitFile, type ImagekitFile } from "@/lib/imagekit";
import { revalidatePath } from "next/cache";

export async function listAssetsAction(
  folder?: string,
  search?: string,
  page = 1
): Promise<ImagekitFile[]> {
  await requireAdmin();
  return listImagekitFiles({ folder, search, page, limit: 30 });
}

export async function deleteAssetAction(fileId: string): Promise<{ ok: boolean; message?: string }> {
  const { admin } = await requireAdmin();
  try {
    await deleteImagekitFile(fileId);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Delete failed.",
    };
  }
}

export async function uploadAssetAction(
  file: File,
  folder: string
): Promise<{ ok: boolean; url?: string; message?: string }> {
  await requireAdmin();
  try {
    const { uploadImageToImageKit } = await import("@/lib/imagekit");
    const result = await uploadImageToImageKit(file, folder);
    revalidatePath("/admin/media");
    return { ok: true, url: result.url };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Upload failed.",
    };
  }
}
