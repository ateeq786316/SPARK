"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { SearchBar } from "@/components/features/search-bar";
import { HeroIllustration } from "@/components/features/hero-illustration";
import { MediaFrame } from "@/components/ui/media-frame";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

type HeroProps = { heroImageUrl?: string | null };

export function Hero({ heroImageUrl }: HeroProps) {
  const router = useRouter();
  const reduce = useReducedMotion() ?? false;

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease },
        };

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-accent/60 via-background to-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-16 lg:pb-24">
        <div className="space-y-6">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <SparkleIcon className="size-4 text-brand" aria-hidden />
            9 types · verified listings · free forever
          </motion.div>
          <motion.h1
            {...fadeUp(0.1)}
            className="font-heading text-4xl font-bold tracking-tighter text-balance leading-none md:text-6xl"
          >
            Find Scholarships, Jobs &{" "}
            <span className="text-brand">Opportunities</span>
          </motion.h1>
          <motion.p
            {...fadeUp(0.2)}
            className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            One verified hub for global education and career opportunities.
            Search, save, and apply with confidence — all in one place.
          </motion.p>
          <motion.div {...fadeUp(0.3)}>
            <SearchBar
              onSearch={(query) =>
                router.push(
                  query
                    ? `/opportunities?q=${encodeURIComponent(query)}`
                    : "/opportunities"
                )
              }
            />
          </motion.div>
          <motion.ul
            {...fadeUp(0.4)}
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {["Verified apply links", "Deadline tracking", "No cost, no catch"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircleIcon className="size-4 text-brand" aria-hidden />
                  {item}
                </li>
              )
            )}
          </motion.ul>
          <motion.a
            {...fadeUp(0.45)}
            href="/opportunities"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            Browse all opportunities
            <ArrowRightIcon className="size-4" aria-hidden />
          </motion.a>
        </div>

        <motion.div
          {...fadeUp(0.25)}
          className="relative hidden lg:block"
        >
          {heroImageUrl ? (
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border shadow-lg">
              <MediaFrame
                src={heroImageUrl}
                alt="Site hero"
                sizes="320px"
                className="object-cover"
              />
            </div>
          ) : (
            <HeroIllustration />
          )}
        </motion.div>
      </div>
    </section>
  );
}
