"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE, MOTION } from "@/lib/motion";

/**
 * Animates a number from 0 to `value` once it scrolls into view. Jumps
 * straight to the final value under prefers-reduced-motion — no animated
 * counting, per the movement system's reduced-motion rule.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    // Duration 0 under reduced motion still resolves through the same
    // onUpdate callback (a genuine external-system subscription) rather
    // than setting state synchronously in the effect body.
    const controls = animate(0, value, {
      duration: prefersReducedMotion ? 0 : MOTION.count,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    return () => controls.stop();
  }, [inView, value, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
