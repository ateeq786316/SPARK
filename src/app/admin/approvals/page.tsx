import { createAdminClient } from "@/lib/supabase/admin";
import { missingRequiredFields, type OpportunityInput } from "@/lib/validators/opportunity";
import { typeLabel } from "@/lib/labels";
import { formatDate } from "@/lib/labels";
import { ApprovalActions } from "@/components/admin/approval-actions";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const admin = createAdminClient();
  const { data: submissions } = await admin
    .from("submissions")
    .select("*, submitter:profiles!submissions_submitter_id_fkey(email)")
    .eq("target_type", "opportunity")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: reviewed } = await admin
    .from("submissions")
    .select("*, submitter:profiles!submissions_submitter_id_fkey(email)")
    .eq("target_type", "opportunity")
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          User-submitted listings awaiting verification. Approve only with an official source URL
          and all required fields.
        </p>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Nothing pending. New user submissions will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions
            .filter((s) => s.status === "pending")
            .map((sub) => {
              const payload = (sub.payload ?? {}) as OpportunityInput;
              const gaps = missingRequiredFields(payload.type, payload.fields as Record<string, unknown>);
              return (
                <div key={sub.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="font-medium">{payload.title ?? "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">
                        {payload.type ? typeLabel(payload.type) : "Unknown type"}
                        {sub.submitter?.email ? ` · submitted by ${sub.submitter.email}` : ""}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(sub.created_at)}</p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {payload.summary || "No summary."}
                  </p>
                  <div className="mt-4">
                    <ApprovalActions submissionId={sub.id} gaps={gaps} />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {reviewed && reviewed.length > 0 ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recently reviewed</h2>
          <div className="space-y-3">
            {reviewed.map((sub) => {
              const payload = (sub.payload ?? {}) as OpportunityInput;
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payload.title ?? "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">{sub.submitter?.email}</p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      sub.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
