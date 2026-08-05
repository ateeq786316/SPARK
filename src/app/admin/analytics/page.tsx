import { createAdminClient } from "@/lib/supabase/admin";
import { OPPORTUNITY_TYPE_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

function todayMinus(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();

  const [eventsRes, recentSignupsRes, publishedRes, topViewsRes] = await Promise.all([
    admin
      .from("events")
      .select("action, day, count")
      .gte("day", todayMinus(90).slice(0, 10)),
    admin
      .from("profiles")
      .select("created_at")
      .gte("created_at", todayMinus(7)),
    admin.from("opportunities").select("type").eq("status", "published"),
    admin
      .from("events")
      .select("target_id, count")
      .eq("action", "view")
      .order("count", { ascending: false })
      .limit(10),
  ]);

  const events = eventsRes.data ?? [];
  const recentSignups = recentSignupsRes.data ?? [];
  const published = publishedRes.data ?? [];
  const topViews = topViewsRes.data ?? [];

  const totals: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  for (const e of events) {
    totals[e.action] = (totals[e.action] ?? 0) + e.count;
    byDay[`${e.action}|${e.day}`] = (byDay[`${e.action}|${e.day}`] ?? 0) + e.count;
  }

  const signupsByDay: Record<string, number> = {};
  for (const p of recentSignups) {
    const day = p.created_at.slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1;
  }

  const byType: Record<string, number> = {};
  for (const o of published) byType[o.type] = (byType[o.type] ?? 0) + 1;

  const targetIds = topViews.map((v) => v.target_id).filter(Boolean) as string[];
  let titles: Record<string, string> = {};
  if (targetIds.length > 0) {
    const { data } = await admin
      .from("opportunities")
      .select("id, title")
      .in("id", targetIds);
    titles = Object.fromEntries((data ?? []).map((o) => [o.id, o.title]));
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Anonymous aggregate activity over the last 90 days.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          ["Views", totals["view"] ?? 0],
          ["Searches", totals["search"] ?? 0],
          ["Saves", totals["save"] ?? 0],
          ["Signups", totals["signup"] ?? 0],
          ["Subscribes", totals["subscribe"] ?? 0],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{(value as number).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Signups — last 7 days</h2>
          <div className="flex h-40 items-end gap-2">
            {last7Days.map((day) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium">{signupsByDay[day] ?? 0}</span>
                <div
                  className="w-full rounded-t bg-amber-500/80"
                  style={{
                    height: `${Math.min(100, ((signupsByDay[day] ?? 0) / 8) * 100)}px`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(`${day}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Published listings by type</h2>
          <div className="flex h-40 items-end gap-2">
            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium">{byType[type] ?? 0}</span>
                <div
                  className="w-full rounded-t bg-amber-500/80"
                  style={{
                    height: `${Math.min(100, ((byType[type] ?? 0) / 6) * 100)}px`,
                  }}
                />
                <span className="hidden text-[10px] text-muted-foreground sm:block">{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold">Most viewed listings</h2>
        {topViews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No view data yet.</p>
        ) : (
          <ol className="space-y-2">
            {topViews.flatMap((v, i) => {
              if (!v.target_id) return [];
              const title = titles[v.target_id];
              if (!title) return [];
              return [
                <li
                  key={v.target_id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span className="truncate font-medium">{title}</span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">{v.count}</span>
                </li>,
              ];
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
