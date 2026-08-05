"use client";

import { useState } from "react";
import { MediaPicker } from "@/components/admin/media-picker";
import { MediaFrame } from "@/components/ui/media-frame";
import { upsertSiteSetting } from "@/lib/db/admin-actions";
import { FlameIcon } from "@/components/ui/icons";

type SiteAsset = "hero_image_url" | "logo_image_url";

interface Props {
  keyName: SiteAsset;
  label: string;
  initial: string | null;
}

function AssetField({ keyName, label, initial }: Props) {
  const [value, setValue] = useState<string | null>(initial ?? null);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(url: string | null) {
    setPending(true);
    setMsg(null);
    try {
      const res = await upsertSiteSetting(keyName, url ?? null);
      setMsg(res.ok ? "Saved." : res.message ?? "Save failed.");
      if (res.ok) setValue(url);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="relative h-40 w-64 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {value ? (
          <MediaFrame src={value} alt={label} sizes="256px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <FlameIcon className="size-8" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{label}</p>
        <MediaPicker
          folder="assets"
          onSelected={(url) => save(url)}
          trigger={
            <button
              type="button"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              {value ? "Change" : "Upload / choose"}
            </button>
          }
        />
        <button
          type="button"
          disabled={pending || !value}
          onClick={() => save(null)}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          {pending ? "Saving…" : "Remove (restore default)"}
        </button>
        {msg ? <p className="text-xs">{msg}</p> : null}
      </div>
    </div>
  );
}

export default function AdminSiteAssetsPage() {
  return (
    <div className="space-y-10 py-2">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Site assets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Replace static site images (hero, logo). Uploaded via ImageKit. A blank value
          restores the in-brand default.
        </p>
      </div>

      <div className="space-y-6">
        <AssetField keyName="hero_image_url" label="Hero image" initial={null} />
        <AssetField keyName="logo_image_url" label="Logo / favicon" initial={null} />
      </div>
    </div>
  );
}
