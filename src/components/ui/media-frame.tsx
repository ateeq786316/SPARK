import Image from "next/image";
import { FlameIcon } from "@/components/ui/icons";

interface MediaFrameProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function MediaFrame({
  src,
  alt,
  className,
  priority = false,
  sizes,
}: MediaFrameProps) {
  if (!src) {
    return (
      <div
        className={
          "relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground/40 " +
          (className ?? "")
        }
        aria-label={alt}
      >
        <FlameIcon className="size-8" aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className ?? "object-cover"}
    />
  );
}
