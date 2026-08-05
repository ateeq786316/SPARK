import Image from "next/image";
import { FlameIcon } from "@/components/ui/icons";

interface MediaFrameProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

export function MediaFrame({
  src,
  alt,
  className,
  priority = false,
  sizes,
  width,
  height,
}: MediaFrameProps) {
  if (!src) {
    const ratio = width && height ? `${width}/${height}` : "16/9";
    return (
      <div
        className={
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground/40 " +
          (className ?? "")
        }
        style={{ aspectRatio: ratio }}
        aria-label={alt}
      >
        <FlameIcon className="size-8" aria-hidden />
      </div>
    );
  }

  if (width !== undefined && height !== undefined) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={className ?? "object-cover"}
      />
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
