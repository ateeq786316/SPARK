"use server";

import { revalidatePath } from "next/cache";
import type { Json } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  missingRequiredFields,
  opportunitySchema,
  type OpportunityInput,
} from "@/lib/validators/opportunity";
import { sendEmail } from "@/lib/email/smtp";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin" || profile.is_suspended) {
    throw new Error("Admin access required.");
  }
  return { admin: createAdminClient(), userId: user.id };
}

export type AdminResult =
  | { ok: true; id?: string; message?: string }
  | {
      ok: false;
      reason: "invalid" | "duplicate" | "gaps" | "error" | "forbidden";
      message?: string;
      gaps?: string[];
    };

function toOpportunityRow(input: OpportunityInput, userId: string, status: "draft" | "published") {
  return {
    type: input.type,
    slug: input.slug,
    status,
    title: input.title,
    summary: input.summary ?? null,
    country: input.country ?? null,
    deadline: input.deadline ?? null,
    source_url: input.source_url ?? null,
    featured_image: input.featured_image ?? null,
    fields: input.fields as unknown as Json,
    featured: input.featured,
    submitter_id: userId,
  };
}

async function findDuplicate(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  input: OpportunityInput,
  excludeId?: string
) {
  const { data } = await admin
    .from("opportunities")
    .select("id")
    .eq("title", input.title)
    .eq("type", input.type)
    .neq("id", excludeId ?? "")
    .maybeSingle();
  return data;
}

export async function createOpportunity(
  input: OpportunityInput,
  opts: { status?: "draft" | "published"; force?: boolean } = {}
): Promise<AdminResult> {
  const { admin, userId } = await requireAdmin();
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid", message: "Invalid listing data." };

  const dup = await findDuplicate(admin, parsed.data);
  if (dup && !opts.force) {
    return { ok: false, reason: "duplicate", message: "A listing with this title and type already exists." };
  }

  const { data, error } = await admin
    .from("opportunities")
    .insert(toOpportunityRow(parsed.data, userId, opts.status ?? "draft"))
    .select("id")
    .single();

  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/opportunities");
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  return { ok: true, id: data.id };
}

export async function updateOpportunity(
  input: OpportunityInput,
  opts: { id?: string; force?: boolean; status?: "draft" | "published" } = {}
): Promise<AdminResult> {
  const { admin, userId } = await requireAdmin();
  if (!opts.id) return { ok: false, reason: "invalid", message: "Missing listing id." };
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid", message: "Invalid listing data." };

  const dup = await findDuplicate(admin, parsed.data, opts.id);
  if (dup && !opts.force) {
    return { ok: false, reason: "duplicate", message: "A listing with this title and type already exists." };
  }

  const row = toOpportunityRow(parsed.data, userId, opts.status ?? "draft");
  const { error } = await admin.from("opportunities").update(row).eq("id", opts.id);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath(`/opportunities/${parsed.data.slug}`);
  revalidatePath("/opportunities");
  revalidatePath("/admin/listings");
  return { ok: true, id: opts.id };
}

export async function setOpportunityStatus(
  id: string,
  status: "draft" | "published" | "closed"
): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("opportunities").update({ status }).eq("id", id);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/opportunities");
  revalidatePath("/admin/listings");
  return { ok: true, id };
}

export async function deleteOpportunity(id: string): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("opportunities").delete().eq("id", id);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/opportunities");
  revalidatePath("/admin/listings");
  return { ok: true, id };
}

export async function approveSubmission(submissionId: string): Promise<AdminResult> {
  const { admin, userId } = await requireAdmin();
  const { data: sub } = await admin.from("submissions").select("*").eq("id", submissionId).single();
  if (!sub || sub.status !== "pending") {
    return { ok: false, reason: "error", message: "Submission is not pending." };
  }

  const parsed = opportunitySchema.safeParse(sub.payload);
  if (!parsed.success) {
    return { ok: false, reason: "invalid", message: "Submission payload is invalid." };
  }
  const input = parsed.data;

  const gaps = missingRequiredFields(input.type, input.fields as Record<string, unknown>);
  if (!input.source_url) gaps.unshift("An official source URL is required.");
  if (gaps.length > 0) {
    return { ok: false, reason: "gaps", gaps, message: "Missing required fields." };
  }

  const dup = await findDuplicate(admin, input);
  if (dup) {
    return { ok: false, reason: "duplicate", message: "A matching listing already exists." };
  }

  const row = toOpportunityRow(input, userId, "published");
  const { data, error } = await admin
    .from("opportunities")
    .insert({ ...row, verified_by: userId, verified_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error) return { ok: false, reason: "error", message: error.message };

  const { error: updateErr } = await admin
    .from("submissions")
    .update({ status: "approved", reviewer_id: userId, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (updateErr) return { ok: false, reason: "error", message: updateErr.message };

  revalidatePath("/opportunities");
  revalidatePath("/admin/approvals");
  return { ok: true, id: data.id };
}

export async function rejectSubmission(submissionId: string): Promise<AdminResult> {
  const { admin, userId } = await requireAdmin();
  const { data: sub } = await admin.from("submissions").select("payload").eq("id", submissionId).single();
  if (!sub) return { ok: false, reason: "error", message: "Submission not found." };

  const parsed = opportunitySchema.safeParse(sub.payload);
  if (parsed.success) {
    const row = toOpportunityRow(parsed.data, userId, "draft");
    const { data } = await admin.from("opportunities").insert(row).select("id").single();
    if (data) {
      await admin
        .from("submissions")
        .update({ status: "rejected", reviewer_id: userId, reviewed_at: new Date().toISOString() })
        .eq("id", submissionId);
      revalidatePath("/admin/approvals");
      revalidatePath("/admin/listings");
      return { ok: true, id: data.id, message: "Moved to drafts." };
    }
  }

  const { error } = await admin
    .from("submissions")
    .update({ status: "rejected", reviewer_id: userId, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/admin/approvals");
  return { ok: true };
}

export interface ArticleInput {
  title: string;
  slug: string;
  category_id: string;
  content: string;
  featured_image?: string;
  seo_keywords?: string;
  related_slugs?: string;
  status: "draft" | "published";
}

export async function upsertArticle(id: string | null, input: ArticleInput): Promise<AdminResult> {
  const { admin, userId } = await requireAdmin();

  const relatedSlugs = (input.related_slugs ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let relatedIds: string[] = [];
  if (relatedSlugs.length > 0) {
    const { data: rel } = await admin
      .from("blog_articles")
      .select("id")
      .in("slug", relatedSlugs);
    relatedIds = (rel ?? []).map((r) => r.id);
  }

  const payload = {
    title: input.title,
    slug: input.slug,
    status: input.status,
    category_id: input.category_id,
    content: input.content,
    featured_image: input.featured_image ?? null,
    seo_keywords:
      (input.seo_keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean) ?? [],
    related_posts: relatedIds,
    author_id: userId,
  };

  if (id) {
    const { error } = await admin.from("blog_articles").update(payload).eq("id", id);
    if (error) return { ok: false, reason: "error", message: error.message };
    revalidatePath(`/blog/${input.slug}`);
  } else {
    const { error } = await admin.from("blog_articles").insert(payload).select("id").single();
    if (error) return { ok: false, reason: "error", message: error.message };
  }
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok: true, id: id ?? undefined };
}

export async function deleteArticle(id: string): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("blog_articles").delete().eq("id", id);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok: true, id };
}

export async function setArticleStatus(
  id: string,
  status: "draft" | "published"
): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("blog_articles").update({ status }).eq("id", id);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok: true, id };
}

export async function setUserRole(userId: string, role: "user" | "admin"): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/admin/users");
  return { ok: true, id: userId };
}

export async function setUserSuspended(userId: string, suspended: boolean): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("profiles").update({ is_suspended: suspended }).eq("id", userId);
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/admin/users");
  return { ok: true, id: userId };
}

export async function broadcastNewsletter(
  subject: string,
  html: string
): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { data: subscribers } = await admin
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "active");

  const emails = (subscribers ?? []).map((s) => s.email).filter(Boolean);
  if (emails.length === 0) return { ok: true, message: "No active subscribers." };

  const BATCH = 10;
  let sent = 0;
  const errors: string[] = [];
  for (let i = 0; i < emails.length; i += BATCH) {
    try {
      await sendEmail({
        to: emails.slice(i, i + BATCH),
        subject,
        html,
      });
      sent += Math.min(BATCH, emails.length - i);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
      break;
    }
  }
  revalidatePath("/admin/email");
  return { ok: true, id: undefined, message: `Sent to ${sent} of ${emails.length}.` + (errors.length ? ` Errors: ${errors.join("; ")}` : "") };
}

export async function upsertSiteSetting(
  key: string,
  value: string | null
): Promise<AdminResult> {
  const { admin } = await requireAdmin();
  const { error } = await admin
    .from("site_settings")
    .upsert({ key, value: value ?? null });
  if (error) return { ok: false, reason: "error", message: error.message };
  revalidatePath("/");
  revalidatePath("/admin/site-assets");
  return { ok: true, id: key };
}
