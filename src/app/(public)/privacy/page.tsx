import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How SPARK handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
        <section className="space-y-1.5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            What we collect
          </h2>
          <p>
            Browsing requires no account. If you subscribe to the newsletter we
            store your email. If you register, we store the details you provide
            in your profile and your saved/applied lists.
          </p>
        </section>
        <section className="space-y-1.5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Analytics
          </h2>
          <p>
            We only track anonymous aggregate counts (listings viewed, searches,
            signups) with no personally identifiable information.
          </p>
        </section>
        <section className="space-y-1.5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Your choices
          </h2>
          <p>
            You can unsubscribe from emails at any time via the link in any
            email, and you can update or delete your account data from your
            settings.
          </p>
        </section>
        <section className="space-y-1.5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Questions about privacy? Email{" "}
            <a href="mailto:privacy@spark.example.com" className="text-brand underline">
              privacy@spark.example.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
