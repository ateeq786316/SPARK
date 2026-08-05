"use client";

import { useState } from "react";
import Image from "next/image";
import { CloudArrowUpIcon } from "@/components/ui/icons";

export function ImageUpload({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    try {
      const { uploadAdminImage } = await import("@/lib/db/upload-action");
      const url = await uploadAdminImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative mb-2 aspect-video overflow-hidden rounded-lg border">
          <Image src={value} alt="" fill sizes="200px" className="object-cover" />
        </div>
      ) : null}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm hover:bg-accent">
        <CloudArrowUpIcon className="size-4" aria-hidden />
        {pending ? "Uploading…" : value ? "Replace image" : "Upload image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          disabled={pending}
        />
      </label>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
