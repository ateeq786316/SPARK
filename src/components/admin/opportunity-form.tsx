"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OpportunityType } from "@/types";
import { OPPORTUNITY_TYPE_LABELS } from "@/lib/labels";
import { FIELD_LABELS } from "@/lib/field-labels";
import { opportunitySchema, type OpportunityInput } from "@/lib/validators/opportunity";
import type { AdminResult } from "@/lib/db/admin-actions";

const TYPES = Object.keys(OPPORTUNITY_TYPE_LABELS) as OpportunityType[];
const ARRAY_FIELDS = new Set(["required_documents", "skills"]);

const BASE_FIELDS: { name: string; label: string; hint?: string }[] = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug", hint: "Auto-generated from the title if left unchanged." },
  { name: "summary", label: "Summary", hint: "Short one-line pitch shown in cards." },
  { name: "country", label: "Country" },
  { name: "deadline", label: "Deadline" },
  { name: "source_url", label: "Official source URL" },
];

type Props = {
  action: (
    input: OpportunityInput,
    opts?: { id?: string; force?: boolean; status?: "draft" | "published" }
  ) => Promise<AdminResult>;
  initial?: OpportunityInput;
  itemId?: string;
  statusControl?: boolean;
  initialStatus?: "draft" | "published";
  submitLabel: string;
  successMessage: string;
  backHref: string;
};

export function OpportunityForm({
  action,
  initial,
  itemId,
  statusControl = false,
  initialStatus = "draft",
  submitLabel,
  successMessage,
  backHref,
}: Props) {
  const router = useRouter();
  const [type, setType] = useState<OpportunityType>(initial?.type ?? "scholarship");
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (initial) {
      for (const [key, value] of Object.entries(initial.fields as Record<string, unknown>)) {
        out[key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
      }
    }
    return out;
  });
  const [base, setBase] = useState<Record<string, string>>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    summary: initial?.summary ?? "",
    country: initial?.country ?? "",
    deadline: initial?.deadline ?? "",
    source_url: initial?.source_url ?? "",
  });
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState<"draft" | "published">(initialStatus);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{ kind: "ok" } | { kind: "error"; message: string } | { kind: "duplicate" } | null>(null);
  const [pending, setPending] = useState(false);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function setBaseField(key: string, value: string) {
    setBase((prev) => {
      if (key === "title" && prev.slug === "") {
        return { ...prev, title: value, slug: slugify(value) };
      }
      return { ...prev, [key]: value };
    });
  }

  async function handleSubmit(e: React.FormEvent, force = false) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    setErrors([]);

    const input: OpportunityInput = {
      type,
      slug: base.slug || slugify(base.title),
      title: base.title,
      summary: base.summary || undefined,
      country: base.country || undefined,
      deadline: base.deadline || undefined,
      source_url: base.source_url || undefined,
      featured,
      fields: Object.fromEntries(
        Object.keys(FIELD_LABELS[type]).map((key) => {
          const value = (fields[key] ?? "").trim();
          return [
            key,
            ARRAY_FIELDS.has(key)
              ? value.split(",").map((s) => s.trim()).filter(Boolean)
              : value,
          ];
        })
      ) as Record<string, never>,
    };

    const parsed = opportunitySchema.safeParse(input);
    if (!parsed.success) {
      setErrors(
        parsed.error.issues.map((issue) => {
          const field = String(issue.path[issue.path.length - 1] ?? "");
          const label = FIELD_LABELS[type][field] ?? field;
          return label ? `${label}: ${issue.message}` : issue.message;
        })
      );
      setPending(false);
      return;
    }

    const res = await action(parsed.data, {
      id: itemId,
      force,
      status: statusControl ? status : undefined,
    });

    if (res.ok) {
      setResult({ kind: "ok" });
      setTimeout(() => router.push(backHref), 600);
    } else if (res.reason === "duplicate") {
      setResult({ kind: "duplicate" });
    } else {
      setResult({ kind: "error", message: res.message ?? "Something went wrong." });
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as OpportunityType)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {OPPORTUNITY_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {BASE_FIELDS.map((field) => (
        <div key={field.name} className="space-y-2">
          <label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
          </label>
          <input
            id={field.name}
            value={base[field.name] ?? ""}
            onChange={(e) => setBaseField(field.name, e.target.value)}
            placeholder={field.name === "deadline" ? "YYYY-MM-DD" : undefined}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          {field.hint ? <p className="text-xs text-muted-foreground">{field.hint}</p> : null}
        </div>
      ))}

      {Object.keys(FIELD_LABELS[type]).map((key) => (
        <div key={key} className="space-y-2">
          <label htmlFor={key} className="text-sm font-medium">
            {FIELD_LABELS[type][key]}
          </label>
          <input
            id={key}
            value={fields[key] ?? ""}
            onChange={(e) => setField(key, e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          {ARRAY_FIELDS.has(key) ? (
            <p className="text-xs text-muted-foreground">Comma-separated list.</p>
          ) : null}
        </div>
      ))}

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="size-4 rounded border-input"
        />
        Featured on the homepage
      </label>

      {statusControl ? (
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      ) : null}

      {errors.length > 0 ? (
        <ul className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {errors.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      ) : null}

      {result?.kind === "error" ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {result.message}
        </p>
      ) : null}

      {result?.kind === "duplicate" ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium">A listing with this title and type already exists.</p>
          <p className="mt-1 text-muted-foreground">
            Create it anyway? Duplicate listings hurt the feed.
          </p>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={pending}
            className="mt-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background"
          >
            Create anyway
          </button>
        </div>
      ) : null}

      {result?.kind === "ok" ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
