import Link from "next/link";
import Image from "next/image";
import { CalendarBlankIcon, MapPinIcon } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { typeLabel, formatDeadline } from "@/lib/labels";
import type { Opportunity } from "@/types";

export function ListingCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Link
      href={`/opportunities/${opportunity.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <article className="overflow-hidden rounded-xl border bg-card transition-shadow group-hover:shadow-md group-focus-visible:shadow-md">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={`https://picsum.photos/seed/${opportunity.slug}/640/360`}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {opportunity.featured ? (
            <Badge className="absolute left-3 top-3">Featured</Badge>
          ) : null}
        </div>
        <div className="space-y-3 p-4">
          <Badge variant="secondary">{typeLabel(opportunity.type)}</Badge>
          <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">
            {opportunity.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {opportunity.country ? (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-4" aria-hidden />
                {opportunity.country}
              </span>
            ) : null}
            {opportunity.deadline ? (
              <span className="inline-flex items-center gap-1">
                <CalendarBlankIcon className="size-4" aria-hidden />
                {formatDeadline(opportunity.deadline)}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
