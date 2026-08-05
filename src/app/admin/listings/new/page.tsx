import { createOpportunity } from "@/lib/db/admin-actions";
import { OpportunityForm } from "@/components/admin/opportunity-form";

export default function NewListingPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">New listing</h1>
        <p className="text-sm text-muted-foreground">
          Type-specific required fields are marked by the form.
        </p>
      </div>
      <OpportunityForm
        action={createOpportunity}
        statusControl
        submitLabel="Create listing"
        successMessage="Listing created."
        backHref="/admin/listings"
      />
    </div>
  );
}
