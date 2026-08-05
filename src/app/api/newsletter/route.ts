import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const subscribeSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (url.searchParams.get("unsubscribe") === "1" && email) {
    const admin = createAdminClient();
    await admin
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed" })
      .eq("email", email.toLowerCase());
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Not found." }, { status: 404 });
}
