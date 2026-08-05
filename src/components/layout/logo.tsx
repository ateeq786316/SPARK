import Link from "next/link";
import { FlameIcon } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/media-frame";

interface LogoProps {
  imageUrl?: string | null;
}

export function Logo({ imageUrl }: LogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-bold tracking-tight"
      aria-label="SPARK home"
    >
      {imageUrl ? (
        <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-lg">
          <MediaFrame src={imageUrl} alt="SPARK" sizes="32px" className="object-cover" />
        </span>
      ) : (
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <FlameIcon className="size-5" weight="fill" aria-hidden />
        </span>
      )}
      <span>SPARK</span>
    </Link>
  );
}
