import { Metadata } from "next";
import { MediaPicker } from "@/components/admin/media-picker";

export const metadata: Metadata = {
  title: "Media | Admin",
};

export default async function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Media library</h1>
          <p className="text-sm text-muted-foreground">
            Browse, upload, and pick images used by blog posts and site assets. All media is
            stored on ImageKit (no Supabase storage used).
          </p>
        </div>
        <MediaPicker
          folder="assets"
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Browse & pick
            </button>
          }
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Use a MediaPicker inside any post or site-asset form to choose from this library,
          or upload a replacement from there.
        </p>
      </div>
    </div>
  );
}
