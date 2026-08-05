import Link from "next/link";
import { FlameIcon } from "@/components/ui/icons";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-bold tracking-tight"
      aria-label="SPARK home"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
        <FlameIcon className="size-5" weight="fill" aria-hidden />
      </span>
      <span>SPARK</span>
    </Link>
  );
}
