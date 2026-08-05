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

describeIf("dashboard actions RLS", () => {
  const admin = createClient(url!, serviceKey!, {
    auth: { persistSession: false },
  });

  async function createUser(email: string) {
    const password = "test-password-123!";
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    return { id: data!.user!.id, email, password };
  }

  async function signIn(email: string, password: string): Promise<string> {
    const client = createClient(url!, anonKey!, {
      auth: { persistSession: false },
    });
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    expect(error).toBeNull();
    return data.session!.access_token;
  }

  function authed(token: string) {
    return createClient(url!, anonKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
  }

  async function makeListing(slug: string) {
    const { data, error } = await admin
      .from("opportunities")
      .insert({
        type: "job",
        slug,
        status: "published",
        title: "RLS dashboard fixture",
        source_url: "https://example.com",
        fields: { organization: "x", location: "y", experience: "z" },
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    return data!.id;
  }

  it(
    "saved_items are owner-only (save, read, unsave)",
    async () => {
      const email = `t028-save-${Date.now()}@example.com`;
      const { id: ownerId, password } = await createUser(email);
      const stranger = await createUser(`t028-stranger-${Date.now()}@example.com`);

      const owner = authed(await signIn(email, password));
      const other = authed(await signIn(stranger.email, stranger.password));
      const oppId = await makeListing(`rls-save-${Date.now()}`);

      const { error: saveErr } = await owner
        .from("saved_items")
        .insert({ user_id: ownerId, opportunity_id: oppId });
      expect(saveErr).toBeNull();

      const { data: own } = await owner
        .from("saved_items")
        .select("opportunity_id")
        .eq("user_id", ownerId);
      expect(own ?? []).toHaveLength(1);

      const { error: forbidden } = await other
        .from("saved_items")
        .insert({ user_id: ownerId, opportunity_id: oppId });
      expect(forbidden).not.toBeNull();

      const { error: unsaveErr } = await owner
        .from("saved_items")
        .delete()
        .eq("user_id", ownerId)
        .eq("opportunity_id", oppId);
      expect(unsaveErr).toBeNull();

      await admin.from("saved_items").delete().eq("user_id", ownerId);
      await admin.from("opportunities").delete().eq("id", oppId);
      await admin.auth.admin.deleteUser(ownerId);
      await admin.auth.admin.deleteUser(stranger.id);
    },
    30_000
  );

  it(
    "application_records are owner-only and conflict on duplicate",
    async () => {
    const email = `t028-applied-${Date.now()}@example.com`;
    const { id: ownerId, password } = await createUser(email);
    const stranger = await createUser(`t028-applied-stranger-${Date.now()}@example.com`);

    const owner = authed(await signIn(email, password));
    const other = authed(await signIn(stranger.email, stranger.password));
    const oppId = await makeListing(`rls-applied-${Date.now()}`);

    const { error: first } = await owner
      .from("application_records")
      .insert({ user_id: ownerId, opportunity_id: oppId });
    expect(first).toBeNull();

    const { error: duplicate } = await owner
      .from("application_records")
      .insert({ user_id: ownerId, opportunity_id: oppId });
    expect(duplicate).not.toBeNull();

    const { data: own } = await owner
      .from("application_records")
      .select("opportunity_id")
      .eq("user_id", ownerId);
    expect(own ?? []).toHaveLength(1);

    const { error: forbidden } = await other
      .from("application_records")
      .insert({ user_id: ownerId, opportunity_id: oppId });
    expect(forbidden).not.toBeNull();

    await admin.from("application_records").delete().eq("user_id", ownerId);
    await admin.from("opportunities").delete().eq("id", oppId);
    await admin.auth.admin.deleteUser(ownerId);
    await admin.auth.admin.deleteUser(stranger.id);
  },
    30_000
  );
});
