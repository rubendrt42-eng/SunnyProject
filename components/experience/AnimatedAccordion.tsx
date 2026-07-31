"use client";

import { useState } from "react";
import { useReducedMotion, AnimatePresence, motion } from "motion/react";
import { EASE, MOTION } from "@/lib/motion";
import { clsx } from "clsx";

export function AnimatedAccordion({
  title,
  items,
  defaultOpen = false,
}: {
  title: string;
  items: string[];
  defaultOpen?: boolean;
}) {
  // Sin desplazamiento cuando se ha pedido menos movimiento. El bloque global
  // de globals.css no alcanza esto: anula transiciones y animaciones de CSS,
  // y esto es un transform animado desde JavaScript.
  const still = useReducedMotion() ?? false;
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-carbon/10 py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-lg font-semibold">{title}</span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={clsx("h-5 w-5 shrink-0 transition-transform duration-[var(--motion-collapse)]", open && "rotate-45")}
        >
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: still ? 0 : MOTION.collapse, ease: EASE }}
            className="overflow-hidden"
          >
            <ul className="mt-3 list-inside list-disc space-y-1 text-carbon">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
