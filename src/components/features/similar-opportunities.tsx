import { getSimilarOpportunities } from "@/lib/db/recommendations";
import { ListingCard } from "@/components/features/listing-card";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/motion";
import type { OpportunityType } from "@/types";

interface SimilarOpportunitiesProps {
  opportunityId: string;
  type: OpportunityType;
  country: string | null;
}

export async function SimilarOpportunities({
  opportunityId,
  type,
  country,
}: SimilarOpportunitiesProps) {
  const similar = await getSimilarOpportunities({
    opportunityId,
    type,
    country,
  });

  if (similar.length === 0) return null;

  return (
    <Reveal className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">You might also like</p>
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Similar opportunities
        </h2>
      </div>
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((opportunity) => (
          <StaggerItem key={opportunity.id}>
            <ListingCard opportunity={opportunity} />
          </StaggerItem>
        ))}
      </Stagger>
    </Reveal>
  );
}
