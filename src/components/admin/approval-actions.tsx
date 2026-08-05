"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import { approveSubmission, rejectSubmission } from "@/lib/db/admin-actions";

export function ApprovalActions({
  submissionId,
  gaps,
}: {
  submissionId: string;
  gaps: string[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function approve() {
    setPending("approve");
    setMessage(null);
    const res = await approveSubmission(submissionId);
    if (!res.ok) {
      if (res.reason === "gaps") {
        setMessage(`Missing: ${(res.gaps ?? []).join(", ")}`);
      } else {
        setMessage(res.message ?? "Approval failed.");
      }
      router.refresh();
      setPending(null);
      return;
    }
    router.refresh();
    setPending(null);
  }

  async function reject() {
    setPending("reject");
    setMessage(null);
    const res = await rejectSubmission(submissionId);
    if (!res.ok) setMessage(res.message ?? "Rejection failed.");
    router.refresh();
    setPending(null);
  }

  return (
    <div className="space-y-2">
      {gaps.length > 0 ? (
        <p className="text-xs text-amber-600">
          Cannot publish until filled: {gaps.join(", ")}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={pending !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          <CheckIcon className="size-4" aria-hidden />
          Approve
        </button>
        <button
          type="button"
          onClick={reject}
          disabled={pending !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 disabled:opacity-50"
        >
          <XIcon className="size-4" aria-hidden />
          Reject
        </button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
