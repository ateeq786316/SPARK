import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const { data: users } = await admin
    .from("profiles")
    .select("id, email, full_name, role, is_suspended, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Promote admins, suspend bad actors, and review the community.
        </p>
      </div>
      <UsersTable users={(users ?? []).map((u) => ({ ...u, role: u.role as "user" | "admin" }))} />
    </div>
  );
}
