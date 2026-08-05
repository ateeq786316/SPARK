import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.loadEnvFile(".env.local");
  }
} catch {
  // .env.local may not exist in CI — tests below skip in that case.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const describeIf =
  url && anonKey && serviceKey ? describe : describe.skip;

describeIf("public listings RLS", () => {
  const admin = createClient(url!, serviceKey!, {
    auth: { persistSession: false },
  });
  const anon = createClient(url!, anonKey!);

  it("anon can only see published/closed opportunities", async () => {
    const slug = `rls-pending-${Date.now()}`;
    const { data: inserted, error } = await admin
      .from("opportunities")
      .insert({
        type: "job",
        slug,
        status: "pending",
        title: "RLS pending fixture",
        fields: { organization: "x", location: "y", experience: "z" },
      })
      .select("id, slug")
      .single();

    expect(error).toBeNull();
    expect(inserted).toBeTruthy();

    const { data: asAnon } = await anon
      .from("opportunities")
      .select("slug")
      .eq("slug", slug);

    expect(asAnon ?? []).toHaveLength(0);

    await admin.from("opportunities").delete().eq("id", inserted!.id);
  });

  it("anon can read published opportunities", async () => {
    const { data, error } = await anon
      .from("opportunities")
      .select("slug")
      .in("status", ["published", "closed"])
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });
});
