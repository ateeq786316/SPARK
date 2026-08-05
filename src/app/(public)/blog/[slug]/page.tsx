import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CalendarBlankIcon, UserCircleIcon } from "@/components/ui/icons";
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapBlogArticle } from "@/lib/mappers";
import { formatDate } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { RelatedPosts } from "@/components/features/related-posts";
import { Reveal } from "@/components/ui/motion";

interface ArticleParams {
  slug: string;
}

export async function generateStaticParams(): Promise<ArticleParams[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_articles")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ArticleParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_articles")
    .select("title, content, featured_image, seo_keywords")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) return {};

  return {
    title: data.title,
    description: (data.content ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
    keywords: data.seo_keywords ?? undefined,
    openGraph: {
      title: data.title,
      description: (data.content ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
      images: data.featured_image ? [data.featured_image] : undefined,
      type: "article",
    },
  };
}

function paragraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<ArticleParams>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("blog_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) notFound();

  const article = mapBlogArticle(data);
  const image =
    article.featuredImage ??
    `https://picsum.photos/seed/${article.slug}/1200/600`;

  const [authorRes, categoryRes] = await Promise.all([
    article.authorId
      ? admin.from("profiles").select("full_name").eq("id", article.authorId).maybeSingle()
      : Promise.resolve(null),
    article.categoryId
      ? admin.from("category").select("name").eq("id", article.categoryId).maybeSingle()
      : Promise.resolve(null),
  ]);

  const authorName = authorRes?.data?.full_name ?? null;
  const categoryName = categoryRes?.data?.name ?? null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Back to blog
      </Link>

      <Reveal>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {categoryName ? <Badge>{categoryName}</Badge> : null}
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarBlankIcon className="size-4" aria-hidden />
              {formatDate(article.createdAt)}
            </span>
            {authorName ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <UserCircleIcon className="size-4" aria-hidden />
                {authorName}
              </span>
            ) : null}
          </div>

          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {article.title}
          </h1>

          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 48rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-8 space-y-5 text-[17px] leading-relaxed text-foreground/90">
        {paragraphs(article.content).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </Reveal>

      <RelatedPosts postIds={article.relatedPosts} />
    </article>
  );
}
