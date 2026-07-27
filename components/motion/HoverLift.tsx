"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Small lift + shadow on hover. `whileHover` in Motion only fires from
 * real pointer hover (not touch taps), so this is naturally inert on
 * mobile — no extra touch-detection needed.
 */
export function HoverLift({
  children,
  className,
  lift = 6,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
