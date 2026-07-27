"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export interface FullscreenMenuLink {
  href: string;
  label: string;
}

/**
 * Full-screen mobile nav overlay: staggered link entrance, Escape to
 * close, background scroll lock, and it hands focus to the first link on
 * open so keyboard users aren't stranded.
 */
export function FullscreenMenu({
  open,
  onClose,
  links,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  links: FullscreenMenuLink[];
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="fixed inset-0 z-[60] flex flex-col bg-ivory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex justify-end p-5">
            <button
              type="button"
              onClick={onClose}
              autoFocus
              aria-label="Cerrar menú"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-carbon/15"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-8 pb-16">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={link.href} onClick={onClose} className="block py-2 font-serif text-4xl italic">
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {footer && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 + links.length * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                {footer}
              </motion.div>
            )}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
