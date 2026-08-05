import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OpportunityInput } from "@/lib/validators/opportunity";
import type { OpportunityType } from "@/types";
import { updateOpportunity } from "@/lib/db/admin-actions";
import { OpportunityForm } from "@/components/admin/opportunity-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const initial: OpportunityInput = {
    type: data.type as OpportunityType,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? undefined,
    country: data.country ?? undefined,
    deadline: data.deadline ?? undefined,
    source_url: data.source_url ?? undefined,
    featured_image: data.featured_image ?? undefined,
    featured: data.featured,
    fields: data.fields as unknown as OpportunityInput["fields"],
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Edit listing</h1>
        <p className="text-sm text-muted-foreground">{data.title}</p>
      </div>
      <OpportunityForm
        action={updateOpportunity}
        initial={initial}
        itemId={id}
        statusControl
        initialStatus={data.status === "published" ? "published" : "draft"}
        submitLabel="Save changes"
        successMessage="Listing saved."
        backHref="/admin/listings"
      />
    </div>
  );
}
