"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpringPressProps
  extends Omit<ComponentProps<typeof motion.div>, "ref"> {
  children: ReactNode;
}

export function SpringPress({ children, className, ...props }: SpringPressProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      className={cn("select-none", className)}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
