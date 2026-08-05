import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/labels";
import { PlusIcon } from "@/components/ui/icons";
import { ArticleRowActions } from "@/components/admin/article-row-actions";

export default async function AdminBlogPage() {
  const admin = createAdminClient();
  const { data: articles } = await admin
    .from("blog_articles")
    .select("id, title, status, category_id, featured_image, created_at, category(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Write, schedule, and manage blog articles.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          <PlusIcon className="size-4" aria-hidden />
          New article
        </Link>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          No articles yet. Write your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map((article) => (
                <tr key={article.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {article.featured_image ? (
                        <img
                          src={article.featured_image}
                          alt=""
                          className="h-9 w-14 rounded object-cover"
                        />
                      ) : null}
                      <span className="font-medium">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {article.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        article.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <ArticleRowActions
                      id={article.id}
                      status={article.status === "published" ? "published" : "draft"}
                      editHref={`/admin/blog/${article.id}/edit`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
