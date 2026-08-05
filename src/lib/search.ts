import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { OpportunityType } from "@/types";

export const SEARCH_PAGE_SIZE = 12;

export interface OpportunityFilters {
  query?: string;
  type?: OpportunityType;
  country?: string;
  openDeadline?: boolean;
}

/** Strip characters that would break websearch_to_tsquery syntax. */
export function sanitizeSearchQuery(input: string): string {
  return input
    .replace(/[!"()&|:*<>]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function searchOpportunities(
  client: SupabaseClient<Database>,
  filters: OpportunityFilters,
  page = 1
) {
  let query = client
    .from("opportunities")
    .select("*", { count: "exact" })
    .in("status", ["published", "closed"]);

  if (filters.query) {
    query = query.textSearch("search_vector", sanitizeSearchQuery(filters.query), {
      type: "websearch",
      config: "english",
    });
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.country) {
    query = query.ilike("country", `%${filters.country}%`);
  }
  if (filters.openDeadline) {
    query = query.gte("deadline", new Date().toISOString().slice(0, 10));
  }

  const from = (page - 1) * SEARCH_PAGE_SIZE;
  return query
    .order("featured", { ascending: false })
    .order("deadline", { ascending: true, nullsFirst: false })
    .range(from, from + SEARCH_PAGE_SIZE - 1);
}

export async function distinctCountries(
  client: SupabaseClient<Database>
): Promise<string[]> {
  const { data } = await client
    .from("opportunities")
    .select("country")
    .in("status", ["published", "closed"])
    .not("country", "is", null);

  return [...new Set((data ?? []).map((row) => row.country!))].sort();
}
