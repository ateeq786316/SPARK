"use client";

import { useState } from "react";
import Link from "next/link";
import { ListIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
        >
          <ListIcon className="size-5" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-4 translate-y-0 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Menu</DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-brand hover:bg-accent hover:text-accent-foreground"
          >
            Sign in
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
