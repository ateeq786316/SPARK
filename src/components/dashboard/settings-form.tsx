"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircleIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Database } from "@/types/database";
import {
  updateProfile,
  type NotificationSettings,
} from "@/lib/db/profiles";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  deadline_reminders: true,
  new_matches: true,
  digest: false,
  newsletter: false,
};

interface SettingsFormProps {
  profile: ProfileRow | null;
  email: string;
}

export function SettingsForm({ profile, email }: SettingsFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [interests, setInterests] = useState(
    (profile?.interests ?? []).join(", ")
  );
  const [newsletterOptIn, setNewsletterOptIn] = useState(
    profile?.newsletter_opt_in ?? false
  );
  const [notifications, setNotifications] = useState<NotificationSettings>({
    ...DEFAULT_NOTIFICATIONS,
    ...(profile?.notification_settings as unknown as NotificationSettings),
  });
  const [saving, setSaving] = useState(false);

  function toggleSetting(key: keyof NotificationSettings) {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        headline: headline.trim(),
        country: country.trim(),
        interests: interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        newsletterOptIn,
        notificationSettings: notifications,
      });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="e.g. MSc student · AI & machine learning"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              autoComplete="country-name"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Input
              id="interests"
              placeholder="scholarship, internship, data science"
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Choose how SPARK reaches you. Unchecking everything opts you out of
            all email.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
            <Checkbox
              checked={notifications.deadline_reminders}
              onCheckedChange={() => toggleSetting("deadline_reminders")}
            />
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Deadline reminders</span>
              <p className="text-xs text-muted-foreground">
                A nudge when a saved opportunity is closing.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
            <Checkbox
              checked={notifications.new_matches}
              onCheckedChange={() => toggleSetting("new_matches")}
            />
            <div className="space-y-0.5">
              <span className="text-sm font-medium">New matches</span>
              <p className="text-xs text-muted-foreground">
                Opportunities matching your interests.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
            <Checkbox
              checked={notifications.digest}
              onCheckedChange={() => toggleSetting("digest")}
            />
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Weekly digest</span>
              <p className="text-xs text-muted-foreground">
                A weekly roundup of new opportunities.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
            <Checkbox
              checked={notifications.newsletter}
              onCheckedChange={() => toggleSetting("newsletter")}
            />
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Newsletter</span>
              <p className="text-xs text-muted-foreground">
                Occasional SPARK updates and resources.
              </p>
            </div>
          </label>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
          <Checkbox
            checked={newsletterOptIn}
            onCheckedChange={(value) => setNewsletterOptIn(Boolean(value))}
          />
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <EnvelopeSimpleIcon className="size-4" aria-hidden />
              Send me the SPARK newsletter
            </span>
            <p className="text-xs text-muted-foreground">
              You can unsubscribe at any time.
            </p>
          </div>
        </label>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircleIcon className="size-4" aria-hidden />
          Changes are saved to your profile.
        </span>
      </div>
    </form>
  );
}
