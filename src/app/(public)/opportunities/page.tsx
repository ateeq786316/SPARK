import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/components/ui/icons";
import {
  OpportunitiesExplorer,
  type ExplorerFilters,
} from "@/components/features/opportunities-explorer";
import { OPPORTUNITY_TYPES, type OpportunityType } from "@/types";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Browse verified scholarships, jobs, internships, fellowships and more.",
};

interface SearchParams {
  q?: string;
  type?: string;
  country?: string;
  open?: string;
}

function parseFilters(searchParams: SearchParams): ExplorerFilters {
  const type = OPPORTUNITY_TYPES.includes(
    searchParams.type as OpportunityType
  )
    ? (searchParams.type as OpportunityType)
    : undefined;

  return {
    query: searchParams.q ?? "",
    type,
    country: searchParams.country ?? "",
    openDeadline: searchParams.open === "1",
  };
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Opportunities
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Every listing is verified with an official apply link. Filter by
              type, country or open deadlines.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background"
          >
            <PlusIcon className="size-4" aria-hidden />
            Suggest an opportunity
          </Link>
        </div>
      </div>
      <OpportunitiesExplorer initial={filters} />
    </div>
  );
}
