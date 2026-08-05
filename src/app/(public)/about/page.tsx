import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What SPARK is and why we built it.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        About SPARK
      </h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          SPARK exists to solve one problem: great educational and career
          opportunities are scattered across thousands of websites, and most
          never reach the people who need them. We collect verified listings —
          scholarships, jobs, internships, fellowships, conferences, exchanges,
          competitions, grants and professional development — into one free,
          searchable hub.
        </p>
        <p>
          Every published listing includes an official application link and
          its type-specific required fields, so you know exactly what you are
          applying for before you click.
        </p>
        <p>
          SPARK is free forever for visitors and free to register. No ads, no
          paywalls, no selling your data.
        </p>
      </div>
    </div>
  );
}
