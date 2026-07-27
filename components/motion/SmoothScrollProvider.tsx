"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Smooth scroll for public marketing pages only — never mounted on
 * /admin, /mi-pase, /mi-cuenta, /historial (see AppChrome). Skipped
 * entirely under prefers-reduced-motion rather than just slowed down.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.11, duration: 1.1, wheelMultiplier: 1, touchMultiplier: 1.2 }}>
      {children}
    </ReactLenis>
  );
}
