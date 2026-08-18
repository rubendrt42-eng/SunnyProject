import type { CSSProperties, ReactNode } from "react";

/**
 * Entrada de una línea o bloque al cargar, con retraso opcional.
 *
 * Se usa en el hero, que está por encima del pliegue: ahí sí interesa que la
 * animación corra al cargar y no al hacer scroll. Por eso lleva
 * `reveal-on-load`, que desactiva la línea de tiempo de scroll y deja el
 * retraso en segundos.
 *
 * Igual que `InViewReveal`, es CSS puro y termina en el estado visible aunque
 * el JavaScript no llegue nunca. Antes era un componente de cliente que
 * server-renderizaba `opacity:0`.
 */
export function LineReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={className ? `reveal reveal-on-load ${className}` : "reveal reveal-on-load"}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
