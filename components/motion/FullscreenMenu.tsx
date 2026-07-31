"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, MOTION, STAGGER } from "@/lib/motion";
import { X } from "lucide-react";
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
  // Sin desplazamiento cuando se ha pedido menos movimiento: entra y sale solo
  // con opacidad. El bloque global de globals.css no alcanza esto — anula
  // transiciones y animaciones de CSS, y esto es un transform desde JavaScript.
  const still = useReducedMotion() ?? false;

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
          transition={{ duration: MOTION.scrim, ease: EASE }}
        >
          <div className="flex justify-end p-5">
            <button
              type="button"
              onClick={onClose}
              autoFocus
              aria-label="Cerrar menú"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-carbon/15"
            >
              <X aria-hidden size={18} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-8 pb-16">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: still ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: MOTION.settle, delay: 0.08 + i * STAGGER.item, ease: EASE }}
              >
                <Link href={link.href} onClick={onClose} className="block py-2 font-serif text-4xl italic">
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {footer && (
              <motion.div
                initial={{ opacity: 0, y: still ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: MOTION.settle, delay: 0.08 + links.length * STAGGER.item, ease: EASE }}
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
