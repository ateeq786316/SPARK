import { createAdminClient } from "@/lib/supabase/admin";
import { remainingQuota } from "@/lib/email/smtp";
import { EmailForm } from "@/components/admin/email-form";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  const admin = createAdminClient();
  const { count: active } = await admin
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Email</h1>
        <p className="text-sm text-muted-foreground">
          Send the newsletter to {active ?? 0} active subscribers via Google SMTP.
        </p>
      </div>
      <EmailForm quota={remainingQuota()} />
      <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
        Reminders and digests for saved opportunities run through{" "}
        <code className="text-foreground">/api/email/send</code>, which is safe to call from a
        cron scheduler (e.g. Vercel Cron) with the <code className="text-foreground">CRON_SECRET</code> header.
      </div>
    </div>
  );
}
