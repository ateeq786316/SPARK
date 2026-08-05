import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/smtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SavedOpportunity = {
  id: string;
  title: string;
  deadline: string | null;
  slug: string;
  type: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

function renderReminderEmail(name: string | null, items: SavedOpportunity[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e7e5e4;">
          <a href="${SITE_URL}/opportunities/${item.slug}" style="color:#18181b;font-weight:600;text-decoration:none;">${item.title}</a>
          <div style="color:#71717a;font-size:13px;margin-top:2px;">
            ${item.deadline ? `Deadline: ${item.deadline}` : "Rolling deadline"}
          </div>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <div style="font-size:20px;font-weight:700;color:#18181b;">${items.length} saved opportunity${items.length > 1 ? "ies" : ""} close this week</div>
      <p style="color:#52525b;margin:12px 0 20px;">Hi ${name ?? "there"}, don't miss the deadlines for opportunities you saved.</p>
      <table style="width:100%;border:1px solid #e7e5e4;border-radius:8px;border-collapse:collapse;">
        ${rows}
      </table>
      <p style="color:#52525b;margin-top:24px;font-size:13px;">You get these because deadline reminders are on in your settings.</p>
    </div>`;
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 503 });
  }
  if (request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);

  const { data: saved } = await admin
    .from("saved_items")
    .select("user_id, opportunities!inner(id, title, deadline, slug, type)")
    .gte("opportunities.deadline", today)
    .lte("opportunities.deadline", soon)
    .eq("opportunities.status", "published");

  const byUser = new Map<string, SavedOpportunity[]>();
  for (const row of saved ?? []) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row.opportunities as SavedOpportunity);
    byUser.set(row.user_id, list);
  }

  if (byUser.size === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, notification_settings, full_name")
    .in("id", [...byUser.keys()]);

  let sent = 0;
  for (const profile of profiles ?? []) {
    if (!profile.email) continue;
    const settings = (profile.notification_settings ?? {}) as Record<string, unknown>;
    if (settings.deadline_reminders === false) continue;

    const items = byUser.get(profile.id) ?? [];
    try {
      await sendEmail({
        to: profile.email,
        subject: `Deadline soon: ${items.length} saved opportunity${items.length > 1 ? "ies" : ""} close this week`,
        html: renderReminderEmail(profile.full_name, items),
      });
      sent += 1;
    } catch {
      break;
    }
  }

  return NextResponse.json({ sent });
}
