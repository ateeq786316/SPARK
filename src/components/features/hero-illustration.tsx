import { FlameIcon } from "@/components/ui/icons";

export function HeroIllustration() {
  return (
    <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border bg-linear-to-br from-brand/10 via-background to-accent/10">
      <svg
        className="absolute inset-0 -z-10 h-full w-full"
        viewBox="0 0 320 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect width="320" height="400" fill="url(#grad)" />
        <circle cx="80" cy="120" r="36" fill="#6366f1" fillOpacity="0.18" />
        <circle cx="240" cy="140" r="28" fill="#f59e0b" fillOpacity="0.18" />
        <circle cx="160" cy="280" r="48" fill="#10b981" fillOpacity="0.14" />
        <path
          d="M160 40 C190 80 230 120 250 160 C270 200 260 240 200 260"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeOpacity="0.25"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M160 40 C110 100 90 160 110 210 C130 260 180 290 210 320"
          stroke="#ec4899"
          strokeWidth="2"
          strokeOpacity="0.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="flex size-20 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg">
        <FlameIcon className="size-10" weight="fill" aria-hidden />
      </span>
    </div>
  );
}
