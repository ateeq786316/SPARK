import Link from "next/link";
import { CalendarBlankIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/labels";
import type { BlogArticle } from "@/types";
import { MediaFrame } from "@/components/ui/media-frame";

export function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <article className="overflow-hidden rounded-xl border bg-card transition-shadow group-hover:shadow-md group-focus-visible:shadow-md">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <MediaFrame
            src={article.featuredImage}
            alt={article.title}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">
            {article.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarBlankIcon className="size-4" aria-hidden />
            {formatDate(article.createdAt)}
          </div>
        </div>
      </article>
    </Link>
  );
}
