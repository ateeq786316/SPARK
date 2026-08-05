"use client";

import { useState } from "react";
import { EnvelopeSimpleIcon } from "@/components/ui/icons";
import { broadcastNewsletter } from "@/lib/db/admin-actions";

export function EmailForm({ quota }: { quota: number }) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);
    if (!subject.trim() || !html.trim()) {
      setError("Subject and body are required.");
      setPending(false);
      return;
    }
    const res = await broadcastNewsletter(subject, html);
    if (!res.ok) {
      setError(res.message ?? "Sending failed.");
    } else {
      setResult(res.message ?? "Sent.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-medium">
          Body (HTML)
        </label>
        <textarea
          id="body"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={10}
          placeholder="<h1>Hello!</h1><p>This week&apos;s top opportunities…</p>"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Sends to active subscribers in batches. {quota} emails remain in today&apos;s quota.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
          {result}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
      >
        <EnvelopeSimpleIcon className="size-4" aria-hidden />
        {pending ? "Sending…" : "Send to all subscribers"}
      </button>
    </form>
  );
}
