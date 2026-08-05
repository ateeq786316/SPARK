import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type SiteSettingKey = "hero_image_url" | "logo_image_url";

export interface SiteSettings {
  hero_image_url: string | null;
  logo_image_url: string | null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["hero_image_url", "logo_image_url"]);
    if (error || !data) return emptySiteSettings();
    return data.reduce<SiteSettings>((acc, row) => {
      const key = row.key as keyof SiteSettings;
      (acc as unknown as Record<string, string | null>)[key] = row.value ?? null;
      return acc;
    }, emptySiteSettings());
  } catch {
    return emptySiteSettings();
  }
}

function emptySiteSettings(): SiteSettings {
  return { hero_image_url: null, logo_image_url: null };
}
