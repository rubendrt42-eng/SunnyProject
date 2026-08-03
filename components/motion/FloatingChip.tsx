"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE, MOTION } from "@/lib/motion";
import type { ReactNode } from "react";
import { clsx } from "clsx";

/**
 * Small pill that floats over full-bleed photography with live data
 * (spots left, category, date) — the "sensor readout over the product
 * shot" motif, positioned by the caller (absolute/relative wrapper).
 */
export function FloatingChip({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: prefersReducedMotion ? 1 : 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: MOTION.enter, delay, ease: EASE }}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-warm-white/95 px-4 py-2 text-sm font-medium text-carbon shadow-lg backdrop-blur",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
