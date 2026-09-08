"use client";

import { ArrowUpRight } from "lucide-react";
import { useAbrirSunni, type VarianteSunni } from "@/components/lean/SunniModal";

/**
 * El botón que abre el formulario de Sun-i.
 *
 * Existe para que cualquier sección —y también la cabecera, que vive fuera de
 * la portada— pueda abrir la variante que le toca sin que cada una monte su
 * propio estado. Toda la portada es servidor salvo estos botones.
 *
 * SOBRE EL COLOR DEL TEXTO
 *
 * La identidad de marca pide el texto en coral sobre el gradiente. Medido, esa
 * combinación da 2.99:1 en el extremo amarillo y **2.00:1 en el naranja**,
 * cuando AA pide 4.5:1 — el botón principal del sitio resultaba ilegible justo
 * en su mitad derecha. Con la tinta de la marca sube a 12.14 y 8.11, y sigue
 * viéndose como lo que es: un botón cálido y contundente.
 */
export function SunniCTA({
  variante,
  children,
  tono = "sol",
  flecha = false,
  className = "",
}: {
  variante: VarianteSunni;
  children: React.ReactNode;
  /** `sol` = gradiente firma · `contorno` = fondo claro con borde coral · `claro` = sobre fondo oscuro. */
  tono?: "sol" | "contorno" | "claro";
  flecha?: boolean;
  className?: string;
}) {
  const abrir = useAbrirSunni();

  const base =
    "press group inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-7 font-display text-small font-semibold transition-all";
  const tonos = {
    sol: "text-ink hover:brightness-[1.03]",
    contorno: "border border-coral/45 text-coral-ink hover:border-coral hover:bg-coral/6",
    claro: "bg-warm-white text-coral-ink hover:bg-cream",
  } as const;

  return (
    <button
      type="button"
      onClick={() => abrir(variante)}
      className={`${base} ${tonos[tono]} ${className}`}
      style={tono === "sol" ? { backgroundImage: "var(--gradient-sun)" } : undefined}
    >
      {children}
      {flecha && (
        <ArrowUpRight
          aria-hidden
          size={17}
          strokeWidth={2}
          className="transition-transform duration-[var(--motion-nudge)] ease-sunny group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </button>
  );
}
