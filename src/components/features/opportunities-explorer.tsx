"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarXIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { searchOpportunities } from "@/lib/search";
import { mapOpportunity } from "@/lib/mappers";
import { OPPORTUNITY_TYPE_LABELS } from "@/lib/labels";
import { OPPORTUNITY_TYPES, type Opportunity, type OpportunityType } from "@/types";
import { SearchBar } from "@/components/features/search-bar";
import { ListingCard } from "@/components/features/listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExplorerFilters {
  query: string;
  type?: OpportunityType;
  country: string;
  openDeadline: boolean;
}

export function OpportunitiesExplorer({
  initial,
}: {
  initial: ExplorerFilters;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<ExplorerFilters>(initial);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const syncUrl = useCallback(
    (next: ExplorerFilters) => {
      const params = new URLSearchParams();
      if (next.query) params.set("q", next.query);
      if (next.type) params.set("type", next.type);
      if (next.country) params.set("country", next.country);
      if (next.openDeadline) params.set("open", "1");
      const qs = params.toString();
      router.replace(qs ? `/opportunities?${qs}` : "/opportunities", {
        scroll: false,
      });
    },
    [router]
  );

  const loadPage = useCallback(
    async (f: ExplorerFilters, p: number, append: boolean) => {
      const client = createClient();
      const { data, count: total, error } = await searchOpportunities(client, f, p);
      if (error) return;
      setCount(total ?? null);
      setItems((prev) =>
        append
          ? [...prev, ...(data ?? []).map(mapOpportunity)]
          : (data ?? []).map(mapOpportunity)
      );
    },
    []
  );

  useEffect(() => {
    const client = createClient();
    client
      .from("opportunities")
      .select("country")
      .in("status", ["published", "closed"])
      .not("country", "is", null)
      .then(({ data }) => {
        setCountries([...new Set((data ?? []).map((row) => row.country!))].sort());
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const timer = setTimeout(async () => {
      await loadPage(filters, 1, false);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [filters, loadPage]);

  const updateFilters = (patch: Partial<ExplorerFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    syncUrl(next);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await loadPage(filters, nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const hasMore = count !== null && items.length < count;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <SearchBar
          defaultValue={filters.query}
          onSearch={(query) => updateFilters({ query })}
          placeholder="Search by keyword, title, university, company…"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          <TypePill
            active={!filters.type}
            label="All types"
            onClick={() => updateFilters({ type: undefined })}
          />
          {OPPORTUNITY_TYPES.map((type) => (
            <TypePill
              key={type}
              active={filters.type === type}
              label={OPPORTUNITY_TYPE_LABELS[type]}
              onClick={() => updateFilters({ type })}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="country-filter" className="text-sm font-medium">
            Country
          </label>
          <select
            id="country-filter"
            value={filters.country}
            onChange={(event) => updateFilters({ country: event.target.value })}
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <Button
            variant={filters.openDeadline ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ openDeadline: !filters.openDeadline })}
            aria-pressed={filters.openDeadline}
          >
            <CalendarXIcon className="size-4" aria-hidden />
            Open deadlines only
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading opportunities">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[16/9] w-full rounded-xl" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="size-6" aria-hidden />}
          title="No opportunities found"
          description="Try a different keyword or clear your filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                const reset = {
                  query: "",
                  type: undefined,
                  country: "",
                  openDeadline: false,
                };
                setFilters(reset);
                syncUrl(reset);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" role="status">
            {count} opportunity{count === 1 ? "" : "s"} found
          </p>
          <div
            className={cn(
              "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
              items.length > 0 && "content-start"
            )}
          >
            {items.map((opportunity) => (
              <ListingCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function TypePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-input bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
