import { createPublicClient } from "@/lib/supabase/public";
import { mapOpportunity } from "@/lib/mappers";
import { OPPORTUNITY_TYPES, type Opportunity, type OpportunityType } from "@/types";

export interface SimilarOpportunitiesInput {
  opportunityId: string;
  type: OpportunityType;
  country: string | null;
  interests?: string[];
}

export async function getSimilarOpportunities({
  opportunityId,
  type,
  country,
  interests = [],
}: SimilarOpportunitiesInput): Promise<Opportunity[]> {
  const supabase = createPublicClient();

  const typeMatch = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "published")
    .eq("type", type)
    .neq("id", opportunityId);

  const countryMatch = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "published")
    .eq("country", country ?? "")
    .neq("id", opportunityId);

  const interestTypes = interests.filter((i): i is OpportunityType =>
    OPPORTUNITY_TYPES.includes(i as OpportunityType)
  );

  const interestMatch =
    interestTypes.length > 0
      ? supabase
          .from("opportunities")
          .select("*")
          .eq("status", "published")
          .in("type", interestTypes)
          .neq("id", opportunityId)
      : null;

  const [a, b, c] = await Promise.all([typeMatch, countryMatch, interestMatch]);

  const seen = new Set<string>();
  const combined: NonNullable<typeof a.data> = [];
  for (const list of [a.data, b.data, c?.data]) {
    for (const row of list ?? []) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        combined.push(row);
      }
    }
  }

  return combined
    .sort((x, y) => (x.deadline ?? "").localeCompare(y.deadline ?? ""))
    .slice(0, 6)
    .map(mapOpportunity);
}
