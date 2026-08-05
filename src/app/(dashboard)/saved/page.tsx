import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mapOpportunity } from "@/lib/mappers";
import type { Database } from "@/types/database";
import { ListingCard } from "@/components/features/listing-card";
import { SaveButton } from "@/components/features/save-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/motion";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("saved_items")
    .select("created_at, opportunities!inner(*)")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const items = (data ?? []).map((row) => ({
    savedAt: row.created_at,
    opportunity: mapOpportunity(row.opportunities as OpportunityRow),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Saved</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} saved {items.length === 1 ? "opportunity" : "opportunities"}.
        </p>
      </div>

      {items.length > 0 ? (
        <Stagger className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <StaggerItem key={item.opportunity.id}>
              <div className="space-y-2">
                <ListingCard opportunity={item.opportunity} />
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-muted-foreground">
                    Saved{" "}
                    {new Date(item.savedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <SaveButton
                    opportunityId={item.opportunity.id}
                    saved
                    showLabel={false}
                  />
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Reveal>
          <EmptyState
            title="Nothing saved yet"
            description="Bookmark opportunities you like so they are easy to find again."
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
