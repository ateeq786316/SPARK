"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleInput } from "@/lib/db/admin-actions";
import type { AdminResult } from "@/lib/db/admin-actions";
import { ImageUpload } from "@/components/admin/image-upload";

type Props = {
  action: (id: string | null, input: ArticleInput) => Promise<AdminResult>;
  initial?: ArticleInput & { id?: string };
  categories: { id: string; name: string }[];
  backHref: string;
};

export function ArticleForm({ action, initial, categories, backHref }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [featuredImage, setFeaturedImage] = useState(initial?.featured_image ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [seoKeywords, setSeoKeywords] = useState(initial?.seo_keywords ?? "");
  const [relatedSlugs, setRelatedSlugs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    const input: ArticleInput = {
      title,
      slug: slug || slugify(title),
      category_id: categoryId,
      content,
      featured_image: featuredImage || undefined,
      seo_keywords: seoKeywords,
      related_slugs: relatedSlugs,
      status,
    };

    const res = await action(initial?.id ?? null, input);
    if (!res.ok) {
      setError(res.message ?? "Something went wrong.");
      setPending(false);
      return;
    }
    setSuccess(true);
    setPending(false);
    setTimeout(() => router.push(backHref), 600);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">URL path for the article.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Featured image</label>
        <ImageUpload value={featuredImage} onChange={setFeaturedImage} folder="blog" />
        <input
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          placeholder="Paragraphs separated by blank lines."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="seo" className="text-sm font-medium">
            SEO keywords
          </label>
          <input
            id="seo"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            placeholder="Comma-separated"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="related" className="text-sm font-medium">
            Related posts
          </label>
          <input
            id="related"
            value={relatedSlugs}
            onChange={(e) => setRelatedSlugs(e.target.value)}
            placeholder="Comma-separated slugs"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
          Article saved.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save article"}
      </button>
    </form>
  );
}
