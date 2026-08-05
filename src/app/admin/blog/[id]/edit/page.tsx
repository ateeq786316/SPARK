import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { upsertArticle } from "@/lib/db/admin-actions";
import { ArticleForm } from "@/components/admin/article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: article } = await admin
    .from("blog_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) notFound();

  const { data: categories } = await admin
    .from("category")
    .select("id, name")
    .eq("kind", "blog")
    .order("name");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Edit article</h1>
        <p className="text-sm text-muted-foreground">{article.title}</p>
      </div>
      <ArticleForm
        action={upsertArticle}
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          category_id: article.category_id ?? "",
          content: article.content,
          featured_image: article.featured_image ?? undefined,
          seo_keywords: (article.seo_keywords ?? []).join(", "),
          status: article.status === "published" ? "published" : "draft",
        }}
        categories={categories ?? []}
        backHref="/admin/blog"
      />
    </div>
  );
}
