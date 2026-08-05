import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks, adminNavLinks } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.user.id)
      .maybeSingle();
    return profile?.role === "admin";
  } catch {
    return false;
  }
}

export async function Header() {
  const showAdmin = await isAdmin();
  const links = [...navLinks, ...(showAdmin ? adminNavLinks : [])];

  return (
    <header className="sticky top-0 z-50 h-14 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden lg:block">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <MobileNav navLinks={links} />
        </div>
      </div>
    </header>
  );
}
