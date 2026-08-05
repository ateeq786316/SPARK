import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

async function exactCount(
  countQuery: {
    then: (resolve: (value: { count: number | null }) => void) => unknown;
  }
): Promise<number> {
  const { count } = await countQuery;
  return count ?? 0;
}

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [published, drafts, closed, pending, users, subscribers, viewEvents] =
    await Promise.all([
      exactCount(
        admin
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("status", "published")
      ),
      exactCount(
        admin
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft")
      ),
      exactCount(
        admin
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("status", "closed")
      ),
      exactCount(
        admin
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      exactCount(admin.from("profiles").select("*", { count: "exact", head: true })),
      exactCount(
        admin
          .from("newsletter_subscribers")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      admin.from("events").select("count").eq("action", "view"),
    ]);

  const views = (viewEvents.data ?? []).reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          High-level numbers for the platform right now.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Published listings" value={published} href="/admin/listings" />
        <StatCard label="Draft listings" value={drafts} href="/admin/listings" />
        <StatCard label="Closed listings" value={closed} href="/admin/listings" />
        <StatCard
          label="Pending approvals"
          value={pending}
          href="/admin/approvals"
        />
        <StatCard label="Registered users" value={users} href="/admin/users" />
        <StatCard label="Newsletter subscribers" value={subscribers} href="/admin/email" />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">Total listing views</p>
        <p className="mt-1 text-2xl font-semibold">{views.toLocaleString()}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Tracked from the public listing pages.{" "}
          <Link href="/admin/analytics" className="underline">
            See analytics
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
