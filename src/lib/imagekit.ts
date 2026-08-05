import "server-only";
import { serverEnv } from "@/lib/env.server";

const IMAGEKIT_ENDPOINT = "https://upload.imagekit.io/api/v1/files/upload";

export interface ImagekitUploadResult {
  fileId: string;
  filePath: string;
  url: string;
  name: string;
  size: number;
}

export async function uploadImageToImageKit(
  file: File,
  folder: string
): Promise<ImagekitUploadResult> {
  const { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = serverEnv;

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const folderPath = folder.startsWith("/") ? folder : `/${folder}`;

  const form = new FormData();
  form.append(
    "file",
    new Blob([await file.arrayBuffer()], { type: file.type || "application/octet-stream" }),
    fileName
  );
  form.append("fileName", fileName);
  form.append("folder", folderPath);
  form.append("useUniqueFileName", "true");

  const auth = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`, "utf8").toString("base64");
  form.append("responseFields", "fileId,filePath,url,name,size");

  const res = await fetch(IMAGEKIT_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `ImageKit upload failed (${res.status}): ${res.statusText}${txt ? ` — ${txt}` : ""}`
    );
  }

  const data = (await res.json()) as {
    fileId?: string;
    filePath?: string;
    url?: string;
    name?: string;
    size?: number;
    message?: string;
  };

  if (!data.url || !data.fileId) {
    throw new Error(data.message ?? "ImageKit upload returned no URL.");
  }

  const url = data.url.startsWith("http")
    ? data.url
    : `${IMAGEKIT_URL_ENDPOINT}${data.filePath ?? ""}${data.name ?? ""}`;

  return {
    fileId: data.fileId,
    filePath: data.filePath ?? `${folderPath}/${fileName}`,
    url,
    name: data.name ?? fileName,
    size: data.size ?? file.size,
  };
}
