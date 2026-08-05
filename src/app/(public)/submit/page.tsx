import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitOpportunity } from "@/lib/db/submissions";
import { OpportunityForm } from "@/components/admin/opportunity-form";

export default async function SubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/submit");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Suggest an opportunity</h1>
        <p className="text-muted-foreground">
          Help other students. Submissions are verified by the team before being published.
        </p>
      </div>
      <OpportunityForm
        action={submitOpportunity}
        submitLabel="Submit for review"
        successMessage="Thanks! Your submission is now pending admin approval."
        backHref="/opportunities"
      />
    </div>
  );
}
