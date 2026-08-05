import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const columns = [
  {
    heading: "Explore",
    links: [
      { href: "/opportunities", label: "All opportunities" },
      { href: "/opportunities?type=scholarship", label: "Scholarships" },
      { href: "/opportunities?type=job", label: "Jobs" },
      { href: "/opportunities?type=internship", label: "Internships" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Verified global scholarships, jobs, internships and opportunities —
            all in one place.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h2 className="mb-3 text-sm font-semibold">{column.heading}</h2>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} SPARK. Built for students and
          professionals worldwide.
        </p>
      </div>
    </footer>
  );
}
