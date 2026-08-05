import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { SettingsForm } from "@/components/dashboard/settings-form";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, interests and email preferences.
        </p>
      </div>
      <SettingsForm profile={profile as ProfileRow | null} email={user.email ?? ""} />
    </div>
  );
}
