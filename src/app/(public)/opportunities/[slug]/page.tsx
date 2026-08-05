import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  MapPinIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@/components/ui/icons";
import { createPublicClient } from "@/lib/supabase/public";
import { mapOpportunity } from "@/lib/mappers";
import { FIELD_LABELS } from "@/lib/field-labels";
import { typeLabel, formatDeadline, formatDate, isExpired } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ui/media-frame";
import { ListingActions } from "@/components/features/listing-actions";
import { SimilarOpportunities } from "@/components/features/similar-opportunities";
import type { OpportunityType } from "@/types";

interface DetailParams {
  slug: string;
}

export async function generateStaticParams(): Promise<DetailParams[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("opportunities")
    .select("slug")
    .in("status", ["published", "closed"]);
  return (data ?? []).map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<DetailParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("opportunities")
    .select("title, summary, type")
    .eq("slug", slug)
    .in("status", ["published", "closed"])
    .single();

  return {
    title: data?.title ?? "Opportunity",
    description:
      data?.summary ??
      `A verified ${typeLabel(data?.type as OpportunityType)} opportunity.`,
  };
}

function FieldValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ul className="flex flex-wrap gap-1.5">
        {value.map((item, index) => (
          <li key={index}>
            <Badge variant="secondary">{String(item)}</Badge>
          </li>
        ))}
      </ul>
    );
  }
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  return <p>{String(value)}</p>;
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<DetailParams>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .in("status", ["published", "closed"])
    .single();

  if (error || !data) notFound();

  const opportunity = mapOpportunity(data);
  const closed = opportunity.status === "closed";
  const expired = opportunity.deadline ? isExpired(opportunity.deadline) : false;
  const labels = FIELD_LABELS[opportunity.type];
  const fields = opportunity.fields as Record<string, unknown>;

  const jsonLd =
    opportunity.type === "job" || opportunity.type === "internship"
      ? {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: opportunity.title,
          description: opportunity.summary ?? opportunity.title,
          datePosted: opportunity.createdAt,
          validThrough: opportunity.deadline ?? undefined,
        }
      : {
          "@context": "https://schema.org",
          "@type": "EducationEvent",
          name: opportunity.title,
          description: opportunity.summary ?? opportunity.title,
          startDate: opportunity.deadline ?? undefined,
          location: opportunity.country ?? undefined,
        };

  supabase.rpc("increment_view_count", { p_slug: slug });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/opportunities"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Back to opportunities
      </Link>

      <div className="mb-8 overflow-hidden rounded-2xl border bg-card">
        <div className="relative aspect-[21/9] bg-muted">
          <MediaFrame
            src={opportunity.featuredImage}
            alt={opportunity.title}
            sizes="(min-width: 1024px) 56rem, 100vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{typeLabel(opportunity.type)}</Badge>
            {closed || expired ? (
              <Badge variant="destructive">
                <XCircleIcon className="size-3.5" aria-hidden />
                Closed
              </Badge>
            ) : (
              <Badge variant="secondary">
                <CheckCircleIcon className="size-3.5 text-brand" aria-hidden />
                Open
              </Badge>
            )}
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {opportunity.title}
          </h1>
          {opportunity.summary ? (
            <p className="text-lg text-muted-foreground">{opportunity.summary}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {opportunity.country ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="size-4" aria-hidden />
                {opportunity.country}
              </span>
            ) : null}
            {opportunity.deadline ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarBlankIcon className="size-4" aria-hidden />
                Deadline: {formatDeadline(opportunity.deadline)}
              </span>
            ) : null}
            {opportunity.verifiedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheckIcon className="size-4 text-brand" aria-hidden />
                Verified {formatDate(opportunity.verifiedAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
        <section className="space-y-6">
          {Object.entries(labels).map(([key, label]) => {
            const value = fields?.[key];
            if (value === undefined || value === null || value === "") return null;
            return (
              <div key={key} className="space-y-1.5">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {label}
                </h2>
                <FieldValue value={value} />
              </div>
            );
          })}
        </section>

        <aside className="h-fit space-y-4 rounded-2xl border bg-card p-5 md:sticky md:top-20">
          <ListingActions
            opportunityId={opportunity.id}
            slug={opportunity.slug}
            sourceUrl={opportunity.sourceUrl}
            canApply={!closed && !expired}
          />
        </aside>
      </div>

      <SimilarOpportunities
        opportunityId={opportunity.id}
        type={opportunity.type}
        country={opportunity.country}
      />
    </div>
  );
}
