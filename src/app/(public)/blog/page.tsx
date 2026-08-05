import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { createPublicClient } from "@/lib/supabase/public";
import { mapBlogArticle } from "@/lib/mappers";
import { ArticleCard } from "@/components/features/article-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Blog & Resources",
  description:
    "Career and application guides, success stories, and practical resources.",
};

interface SearchParams {
  category?: string;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await searchParams;
  const supabase = createPublicClient();

  const [articlesRes, categoriesRes] = await Promise.all([
    supabase.from("blog_articles").select("*").eq("status", "published"),
    supabase.from("category").select("id, name").eq("kind", "blog"),
  ]);

  const categories = categoriesRes.data ?? [];
  const selectedCategory = categories.find((c) => c.name === category);

  const all = (articlesRes.data ?? []).map(mapBlogArticle);
  const articles = selectedCategory
    ? all.filter((article) => article.categoryId === selectedCategory.id)
    : all;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Blog & Resources
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Practical guides, application tips, and real success stories.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Link
          href="/blog"
          aria-current={!selectedCategory ? "page" : undefined}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "border-brand bg-brand text-brand-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </Link>
        {categories.map((c) => {
          const active = selectedCategory?.id === c.id;
          return (
            <Link
              key={c.id}
              href={`/blog?category=${encodeURIComponent(c.name)}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {articles.length > 0 ? (
        <Reveal>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <StaggerItem key={article.id}>
                <ArticleCard article={article} />
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>
      ) : (
        <EmptyState
          title={selectedCategory ? "No articles in this category yet" : "No articles yet"}
          description={
            selectedCategory
              ? "Check back soon for guides and stories in this category."
              : "Guides and success stories are on the way — check back soon."
          }
          action={
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              Browse opportunities instead <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          }
        />
      )}
    </div>
  );
}
