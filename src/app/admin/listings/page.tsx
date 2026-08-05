import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { typeLabel } from "@/lib/labels";
import type { OpportunityType } from "@/types";
import { PlusIcon } from "@/components/ui/icons";
import { ListingRowActions } from "@/components/admin/listing-row-actions";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600",
  draft: "bg-muted text-muted-foreground",
  closed: "bg-rose-500/10 text-rose-600",
};

export default async function AdminListingsPage() {
  const admin = createAdminClient();
  const { data: listings } = await admin
    .from("opportunities")
    .select("id, title, type, status, country, deadline, featured, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Listings</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, publish, and remove opportunities.
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          <PlusIcon className="size-4" aria-hidden />
          New listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          No listings yet. Create your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {listings.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      {item.title}
                      {item.featured ? <span className="ml-1 text-xs text-amber-600">★</span> : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{typeLabel(item.type as OpportunityType)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.country ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.deadline ?? "—"}</td>
                  <td className="px-4 py-3">
                    <ListingRowActions
                      id={item.id}
                      status={item.status as "draft" | "published" | "closed"}
                      editHref={`/admin/listings/${item.id}/edit`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
