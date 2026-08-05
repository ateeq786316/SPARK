"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!consent) {
      toast.error("Please tick the consent box to receive emails.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail("");
        setConsent(false);
        toast.success("You're on the list — welcome to SPARK!");
      } else {
        toast.error(data?.error ?? "Could not subscribe. Try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="rounded-2xl border bg-muted/40 p-8 sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Never miss a deadline
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Get new scholarships, jobs and internships in your inbox.
            Unsubscribe anytime.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-12 sm:flex-1"
              />
              <Button type="submit" disabled={loading} className="h-12">
                <PaperPlaneTiltIcon className="size-4" aria-hidden />
                {loading ? "Subscribing…" : "Subscribe"}
              </Button>
            </div>
            <div className="flex items-start gap-2 text-left">
              <Checkbox
                id="newsletter-consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
              />
              <Label
                htmlFor="newsletter-consent"
                className="text-xs text-muted-foreground"
              >
                I consent to receiving email updates from SPARK. You can opt out
                at any time via the unsubscribe link.
              </Label>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
