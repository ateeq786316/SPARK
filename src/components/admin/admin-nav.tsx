"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChartLineIcon,
  EnvelopeSimpleIcon,
  GaugeIcon,
  GearIcon,
  ListBulletsIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  SealCheckIcon,
  SignOutIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Overview", icon: GaugeIcon, exact: true },
  { href: "/admin/listings", label: "Listings", icon: ListBulletsIcon },
  { href: "/admin/approvals", label: "Approvals", icon: SealCheckIcon },
  { href: "/admin/blog", label: "Blog", icon: NotePencilIcon },
  { href: "/admin/media", label: "Media", icon: PencilSimpleIcon },
  { href: "/admin/site-assets", label: "Site assets", icon: GearIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/analytics", label: "Analytics", icon: ChartLineIcon },
  { href: "/admin/email", label: "Email", icon: EnvelopeSimpleIcon },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Admin">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <link.icon className="size-4" aria-hidden />
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Back to site
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      >
        <SignOutIcon className="size-4" aria-hidden />
        Sign out
      </button>
    </nav>
  );
}
