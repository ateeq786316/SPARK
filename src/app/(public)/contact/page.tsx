import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the SPARK team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Contact us
      </h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          Found a listing that needs fixing, or want to report a verified
          opportunity? We read every message.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            General / reporting an issue:{" "}
            <a href="mailto:hello@spark.example.com" className="text-brand underline">
              hello@spark.example.com
            </a>
          </li>
          <li>
            Partner or publisher:{" "}
            <a href="mailto:partners@spark.example.com" className="text-brand underline">
              partners@spark.example.com
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
