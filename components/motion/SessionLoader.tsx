"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const STORAGE_KEY = "sunny-loader-shown";
const DURATION_MS = 750;

/**
 * Brief editorial loader shown once per browser session on public pages.
 * Gated on sessionStorage so it never re-appears when navigating between
 * pages, and skipped entirely under prefers-reduced-motion.
 */
export function SessionLoader() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      return;
    }

    if (sessionStorage.getItem(STORAGE_KEY)) return;

    sessionStorage.setItem(STORAGE_KEY, "1");

    // Deferred to a rAF callback rather than called synchronously in the
    // effect body — this is a genuine one-time reveal driven by an
    // external system (sessionStorage), not state mirrored from props.
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => setVisible(false), DURATION_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ivory"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
        >
          <p className="font-serif text-3xl italic text-carbon">Sunny Project</p>
          <div className="mt-6 h-0.5 w-40 overflow-hidden rounded-full bg-carbon/10">
            <motion.div
              className="h-full bg-orange"
              style={{ originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
