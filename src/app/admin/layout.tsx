import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row">
      <div className="shrink-0 space-y-3 md:w-52">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{profile?.full_name ?? "Admin"}</p>
          <p className="break-all text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <AdminNav />
      </div>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
