"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOutIcon,
  BookmarkSimpleIcon,
  CheckCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toggleSave } from "@/lib/db/saved";
import { markApplied, removeApplied } from "@/lib/db/applied";

interface ListingActionsProps {
  opportunityId: string;
  slug: string;
  sourceUrl: string | null;
  canApply: boolean;
}

export function ListingActions({
  opportunityId,
  slug,
  sourceUrl,
  canApply,
}: ListingActionsProps) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appliedAt, setAppliedAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<"save" | "apply" | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setReady(true);
        return;
      }
      setSignedIn(true);
      const [savedRes, appliedRes] = await Promise.all([
        supabase
          .from("saved_items")
          .select("opportunity_id")
          .eq("user_id", user.id)
          .eq("opportunity_id", opportunityId)
          .maybeSingle(),
        supabase
          .from("application_records")
          .select("applied_at")
          .eq("user_id", user.id)
          .eq("opportunity_id", opportunityId)
          .maybeSingle(),
      ]);
      if (active) {
        setSaved(Boolean(savedRes.data));
        setApplied(Boolean(appliedRes.data));
        setAppliedAt(appliedRes.data?.applied_at ?? null);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [opportunityId]);

  if (!ready) {
    return (
      <div className="space-y-2">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  async function handleSave() {
    if (!signedIn) {
      router.push(`/login?next=/opportunities/${slug}`);
      return;
    }
    setBusy("save");
    try {
      const result = await toggleSave(opportunityId);
      setSaved(result.saved);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleMarkApplied() {
    setBusy("apply");
    try {
      await markApplied(opportunityId);
      setApplied(true);
      setAppliedAt(new Date().toISOString());
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleRemoveApplied() {
    setBusy("apply");
    try {
      await removeApplied(opportunityId);
      setApplied(false);
      setAppliedAt(null);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {canApply && sourceUrl ? (
        <Button asChild className="w-full">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply now
            <ArrowSquareOutIcon className="size-4" aria-hidden />
          </a>
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="font-heading font-semibold">Applications closed</p>
          <p className="text-sm text-muted-foreground">
            This listing is no longer accepting applications.
          </p>
        </div>
      )}

      {canApply ? (
        <>
          {signedIn && !applied ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={busy !== null}
              onClick={handleMarkApplied}
            >
              <CheckCircleIcon className="size-4" aria-hidden />
              {busy === "apply" ? "Saving…" : "Mark as applied"}
            </Button>
          ) : null}

          {signedIn && applied ? (
            <div className="space-y-2 rounded-lg border border-brand/30 bg-brand/5 p-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                <CheckCircleIcon className="size-4" aria-hidden />
                Marked as applied
              </p>
              {appliedAt ? (
                <p className="text-xs text-muted-foreground">
                  {new Date(appliedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleRemoveApplied}
                disabled={busy !== null}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3.5" aria-hidden />
                Remove
              </button>
            </div>
          ) : null}

          <Button
            type="button"
            variant={saved ? "default" : "outline"}
            className="w-full"
            disabled={busy !== null}
            onClick={handleSave}
            aria-pressed={saved}
          >
            <BookmarkSimpleIcon
              className="size-4"
              weight={saved ? "fill" : "regular"}
              aria-hidden
            />
            {busy === "save" ? "Saving…" : saved ? "Saved" : "Save"}
          </Button>
        </>
      ) : null}

      {!signedIn ? (
        <p className="text-center text-xs text-muted-foreground">
          <Link href={`/login?next=/opportunities/${slug}`} className="font-medium text-brand hover:underline">
            Sign in
          </Link>{" "}
          to save and track applications.
        </p>
      ) : null}
    </div>
  );
}
