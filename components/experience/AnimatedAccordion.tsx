"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
          className={clsx("h-5 w-5 shrink-0 transition-transform duration-300", open && "rotate-45")}
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
