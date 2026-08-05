import { createPublicClient } from "@/lib/supabase/public";
import { mapBlogArticle } from "@/lib/mappers";
import { ArticleCard } from "@/components/features/article-card";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export async function RelatedPosts({ postIds }: { postIds: string[] }) {
  if (postIds.length === 0) return null;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("status", "published")
    .in("id", postIds);

  const posts = (data ?? []).map(mapBlogArticle);
  if (posts.length === 0) return null;

  return (
    <Reveal className="mt-16">
      <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight">
        Related reading
      </h2>
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <StaggerItem key={post.id}>
            <ArticleCard article={post} />
          </StaggerItem>
        ))}
      </Stagger>
    </Reveal>
  );
}
