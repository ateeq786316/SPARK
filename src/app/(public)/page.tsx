import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { createPublicClient } from "@/lib/supabase/public";
import { mapBlogArticle, mapOpportunity } from "@/lib/mappers";
import { getSiteSettings } from "@/lib/db/site-settings";
import { Hero } from "@/components/features/hero";
import { ListingCard } from "@/components/features/listing-card";
import { ArticleCard } from "@/components/features/article-card";
import { NewsletterCta } from "@/components/features/newsletter-cta";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Find Scholarships, Jobs & Opportunities",
  description:
    "Discover verified global scholarships, jobs, internships, fellowships and more in one place.",
};

async function getHomeData() {
  const supabase = createPublicClient();

  const [{ data: featured }, { data: latest }, { data: storyCategory }, settings] =
    await Promise.all([
      supabase
        .from("opportunities")
        .select("*")
        .eq("status", "published")
        .eq("featured", true)
        .order("deadline", { ascending: true })
        .limit(6),
      supabase
        .from("opportunities")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("category")
        .select("id")
        .eq("name", "Success Stories")
        .single(),
      getSiteSettings(),
    ]);

  let stories: ReturnType<typeof mapBlogArticle>[] = [];
  if (storyCategory) {
    const { data } = await supabase
      .from("blog_articles")
      .select("*")
      .eq("status", "published")
      .eq("category_id", storyCategory.id)
      .order("created_at", { ascending: false })
      .limit(3);
    stories = (data ?? []).map(mapBlogArticle);
  }

  return {
    featured: (featured ?? []).map(mapOpportunity),
    latest: (latest ?? []).map(mapOpportunity),
    stories,
    heroImageUrl: settings.hero_image_url,
  };
}

export default async function HomePage() {
  const { featured, latest, stories, heroImageUrl } = await getHomeData();

  return (
    <>
      <Hero heroImageUrl={heroImageUrl} />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">Handpicked</p>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Featured opportunities
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            View all <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>

        {featured.length > 0 ? (
          <Stagger
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.08}
          >
            {featured.map((opportunity) => (
              <StaggerItem key={opportunity.id}>
                <ListingCard opportunity={opportunity} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        )}
      </section>

      {latest.length > 0 ? (
        <section className="bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-8">
              <p className="text-sm font-semibold text-brand">Fresh off the press</p>
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Latest updates
              </h2>
            </div>
            <Stagger
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.08}
            >
              {latest.map((opportunity) => (
                <StaggerItem key={opportunity.id}>
                  <ListingCard opportunity={opportunity} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {stories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold text-brand">Real journeys</p>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Success stories
            </h2>
          </div>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((article) => (
              <StaggerItem key={article.id}>
                <ArticleCard article={article} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      <Reveal>
        <NewsletterCta />
      </Reveal>
    </>
  );
}
