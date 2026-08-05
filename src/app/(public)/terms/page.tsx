import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms of using SPARK.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Terms of Use
      </h1>
      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
        <p>
          SPARK aggregates publicly available opportunity listings for
          informational purposes. We aim to keep every listing accurate and
          verified, but we do not guarantee that external links, deadlines or
          eligibility criteria are current — always confirm details on the
          official source before applying.
        </p>
        <p>
          Listing content belongs to its original source. By submitting content
          to SPARK you confirm it is accurate and that you have the right to
          share it.
        </p>
        <p>
          SPARK is provided &quot;as is&quot; and is not an employment or
          admissions agency. We never charge users for access to opportunities.
        </p>
      </div>
    </div>
  );
}
