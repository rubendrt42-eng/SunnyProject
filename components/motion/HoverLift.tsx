import type { CSSProperties, ReactNode } from "react";

/**
 * Elevación al pasar el cursor.
 *
 * Era el primitivo más caro del sitio: un componente de cliente con la librería
 * de animación envolviendo **cada tarjeta de experiencia**, o sea el elemento
 * que más se repite. Ahora es una clase de CSS y un componente de servidor.
 *
 * El comportamiento no cambia, y las dos protecciones que tenía siguen ahí,
 * ahora en `globals.css`: `@media (hover: hover)` para que no se quede pegado
 * en pantallas táctiles, y `prefers-reduced-motion` para quien pidió que las
 * cosas no se movieran. Esa segunda importa: quien activa ese ajuste suele
 * hacerlo por vértigo o migraña, y esto envuelve lo que más se toca del sitio.
 */
export function HoverLift({
  children,
  className,
  lift = 6,
}: {
  children: ReactNode;
  className?: string;
  /** Cuánto sube, en píxeles. */
  lift?: number;
}) {
  return (
    <div
      className={className ? `hover-lift ${className}` : "hover-lift"}
      style={{ "--lift": `${lift}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
