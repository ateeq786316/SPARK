import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://spark.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunities")
    .select("slug, updated_at")
    .in("status", ["published", "closed"]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/opportunities",
    "/blog",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const listings: MetadataRoute.Sitemap = (data ?? []).map((row) => ({
    url: `${BASE_URL}/opportunities/${row.slug}`,
    lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
  }));

  return [...staticRoutes, ...listings];
}
