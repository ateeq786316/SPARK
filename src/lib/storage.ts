import "server-only";
import { uploadImageToImageKit } from "@/lib/imagekit";

export interface UploadedImage {
  url: string;
  fileId: string;
  filePath: string;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const result = await uploadImageToImageKit(file, folder);
  return result.url;
}
