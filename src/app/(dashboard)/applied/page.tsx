import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mapOpportunity } from "@/lib/mappers";
import { typeLabel, isExpired } from "@/lib/labels";
import type { Database } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/features/listing-card";
import { RemoveAppliedButton } from "@/components/features/remove-applied-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/motion";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];

export default async function AppliedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("application_records")
    .select("applied_at, notes, opportunities!inner(*)")
    .eq("user_id", user?.id ?? "")
    .order("applied_at", { ascending: false });

  if (error) throw new Error(error.message);

  const items = (data ?? []).map((row) => ({
    appliedAt: row.applied_at,
    notes: row.notes,
    opportunity: mapOpportunity(row.opportunities as OpportunityRow),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Applications
        </h1>
        <p className="text-sm text-muted-foreground">
          Track every application in one place.
        </p>
      </div>

      {items.length > 0 ? (
        <Stagger className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => {
            const closed =
              item.opportunity.status === "closed" ||
              (item.opportunity.deadline
                ? isExpired(item.opportunity.deadline)
                : false);
            return (
              <StaggerItem key={item.opportunity.id}>
                <div className="space-y-2">
                  <ListingCard opportunity={item.opportunity} />
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Applied{" "}
                        {new Date(item.appliedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <Badge variant={closed ? "destructive" : "secondary"}>
                        {closed ? "Closed" : `${typeLabel(item.opportunity.type)} · Open`}
                      </Badge>
                    </div>
                    <RemoveAppliedButton opportunityId={item.opportunity.id} />
                  </div>
                  {item.notes ? (
                    <p className="px-1 text-xs text-muted-foreground">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      ) : (
        <Reveal>
          <EmptyState
            title="No applications tracked"
            description="Mark listings as applied to keep your applications organized."
            action={
              <Link
                href="/opportunities"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-transform active:scale-95"
              >
                Browse opportunities
              </Link>
            }
          />
        </Reveal>
      )}
    </div>
  );
}
