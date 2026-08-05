import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row">
      <div className="shrink-0 space-y-3 md:w-56">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{profile?.full_name ?? "Account"}</p>
          <p className="break-all text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DashboardNav />
      </div>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
