"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSimpleIcon, TrashIcon } from "@/components/ui/icons";
import {
  deleteOpportunity,
  setOpportunityStatus,
} from "@/lib/db/admin-actions";

export function ListingRowActions({
  id,
  status,
  editHref,
}: {
  id: string;
  status: "draft" | "published" | "closed";
  editHref: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(next: string) {
    setPending(true);
    setError(null);
    const res = await setOpportunityStatus(id, next as "draft" | "published" | "closed");
    if (!res.ok) setError(res.message ?? "Failed.");
    router.refresh();
    setPending(false);
  }

  async function remove() {
    if (!window.confirm("Delete this listing permanently?")) return;
    setPending(true);
    const res = await deleteOpportunity(id);
    if (!res.ok) setError(res.message ?? "Failed.");
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => changeStatus(e.target.value)}
        disabled={pending}
        className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        aria-label="Status"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="closed">Closed</option>
      </select>
      <a
        href={editHref}
        className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1.5 text-xs hover:bg-accent"
        aria-label="Edit"
      >
        <PencilSimpleIcon className="size-3.5" aria-hidden />
        Edit
      </a>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50"
        aria-label="Delete"
      >
        <TrashIcon className="size-3.5" aria-hidden />
        Delete
      </button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
