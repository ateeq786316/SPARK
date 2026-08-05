"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon, CheckIcon, CloudArrowUpIcon } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/media-frame";
import type { ImagekitFile } from "@/lib/imagekit";

export function MediaPicker({
  trigger,
  folder = "blog",
  onSelected,
}: {
  trigger: React.ReactNode;
  folder?: string;
  onSelected?: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<ImagekitFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { listAssetsAction } = await import("@/lib/db/imagekit-actions");
      const data = await listAssetsAction(folder, search);
      setFiles(data);
    } catch (e) {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open, search]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const { uploadAssetAction } = await import("@/lib/db/imagekit-actions");
      await uploadAssetAction(f, folder);
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileId: string) {
    if (!confirm("Delete this image? This can't be undone.")) return;
    const { deleteAssetAction } = await import("@/lib/db/imagekit-actions");
    const res = await deleteAssetAction(fileId);
    if (res.ok) setFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  }

  function pick(url: string) {
    onSelected?.(url);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search images…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={() => {
              if (search) load();
            }}
          />
          <Button asChild variant="outline" size="sm">
            <label className="cursor-pointer">
              <CloudArrowUpIcon className="mr-2 size-4" /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </Button>
        </div>
        <div className="mt-2 grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No images found.</p>
          ) : (
            files.map((f) => (
              <div key={f.fileId} className="group relative aspect-[4/3] rounded-lg border bg-muted">
                <MediaFrame src={f.url} alt={f.name} className="object-cover" sizes="200px" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-7"
                    onClick={() => pick(f.url)}
                  >
                    <CheckIcon className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="size-7"
                    onClick={() => handleDelete(f.fileId)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
