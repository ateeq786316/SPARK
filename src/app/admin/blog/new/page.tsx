import { createAdminClient } from "@/lib/supabase/admin";
import { upsertArticle } from "@/lib/db/admin-actions";
import { ArticleForm } from "@/components/admin/article-form";

export default async function NewArticlePage() {
  const admin = createAdminClient();
  const { data: categories } = await admin
    .from("category")
    .select("id, name")
    .eq("kind", "blog")
    .order("name");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">New article</h1>
        <p className="text-sm text-muted-foreground">
          Articles help students research opportunities and are shown across the site.
        </p>
      </div>
      <ArticleForm
        action={upsertArticle}
        categories={categories ?? []}
        backHref="/admin/blog"
      />
    </div>
  );
}
