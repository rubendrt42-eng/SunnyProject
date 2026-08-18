"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { STAGGER } from "@/lib/motion";
import { X } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

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
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * Bloqueo de scroll, cierre con Escape, foco atrapado dentro y foco devuelto
   * al cerrar.
   *
   * Las dos últimas no son adorno. Sin la trampa, tabular dentro de un panel a
   * pantalla completa saca el foco por detrás del panel: quien navega con
   * teclado se queda recorriendo enlaces que no puede ver. Y sin devolver el
   * foco, al cerrar el menú el punto de partida se pierde y hay que volver a
   * recorrer la página desde arriba.
   */
  useEffect(() => {
    if (!open) return;

    const disparador = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const foco = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const elementos = foco();
      if (elementos.length === 0) return;
      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      // Devolver el foco a quien abrió el menú, no al principio del documento.
      disparador?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className="reveal reveal-on-load fixed inset-0 z-[60] flex flex-col bg-ivory"
      style={{ "--reveal-y": "0px" } as CSSProperties}
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
              <div
                key={link.href}
                className="reveal reveal-on-load"
                style={{ "--reveal-delay": `${0.08 + i * STAGGER.item}s`, "--reveal-y": "24px" } as CSSProperties}
              >
                <Link href={link.href} onClick={onClose} className="block py-2 font-serif text-4xl italic">
                  {link.label}
                </Link>
              </div>
            ))}

            {footer && (
              <div
                className="reveal reveal-on-load mt-8"
                style={
                  {
                    "--reveal-delay": `${0.08 + links.length * STAGGER.item}s`,
                    "--reveal-y": "24px",
                  } as CSSProperties
                }
              >
                {footer}
              </div>
            )}
      </nav>
    </div>
  );
}
