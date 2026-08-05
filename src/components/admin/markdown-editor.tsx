"use client";

import { useState, useEffect, useRef } from "react";
import { markdownToHtml, articleTemplate } from "@/lib/markdown";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  label = "Content (Markdown)",
  placeholder = "Write in Markdown… # Headings, **bold**, - lists, [link](url)",
  rows = 14,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMounted(true), []);

  const insertTemplate = () => {
    if (!value.trim()) {
      onChange(articleTemplate);
      setTab("preview");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          {!value.trim() ? (
            <button
              type="button"
              onClick={insertTemplate}
              className="text-xs font-medium text-brand hover:underline"
            >
              Insert article template
            </button>
          ) : null}
          <div className="flex items-center gap-1 rounded-md bg-muted p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={
                "rounded px-2 py-0.5 font-medium " +
                (tab === "write"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground")
              }
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={
                "rounded px-2 py-0.5 font-medium " +
                (tab === "preview"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground")
              }
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-input bg-background">
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full resize-y border-0 bg-transparent px-3 py-2.5 text-sm font-mono outline-none placeholder-muted-foreground/60"
          />
        ) : (
          <div
            role="presentation"
            className="prose prose-sm max-w-none overflow-x-auto px-3 py-2.5 text-sm"
          >
            {mounted ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(value || placeholder),
                }}
              />
            ) : (
              <p className="text-muted-foreground">Loading preview…</p>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Markdown supported: # headings, **bold**, *italic*, inline code, fenced
        code blocks, bullet lists, blockquotes, and links.
      </p>
    </div>
  );
}
