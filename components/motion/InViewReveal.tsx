import type { CSSProperties, ReactNode } from "react";

/**
 * Revelado de un bloque al entrar en pantalla, **sin JavaScript**.
 *
 * QUÉ ERA ANTES Y POR QUÉ CAMBIÓ
 *
 * Era un componente de cliente que usaba la librería de animación. Salía del
 * servidor con `opacity:0` en línea y solo se hacía visible cuando el navegador
 * terminaba de descargar, ejecutar e hidratar el JavaScript. Como este
 * componente envuelve casi todo el cuerpo del sitio, el fallo tenía un tamaño
 * concreto: si el JavaScript no llegaba, el visitante veía los fondos de las
 * secciones y ni una palabra dentro. La auditoría lo reprodujo y hay capturas.
 *
 * Ahora es un componente de servidor que solo pone una clase. La animación vive
 * en `globals.css` y acaba siempre en el estado visible: con línea de tiempo de
 * scroll donde el navegador la soporta, al cargar donde no, y sin animación con
 * `prefers-reduced-motion`. Ninguna de las tres rutas depende de que se ejecute
 * código.
 *
 * SOBRE EL RETRASO
 *
 * `delay` sigue existiendo para escalonar una rejilla, pero se traduce a dos
 * cosas distintas: segundos cuando la animación corre al cargar, y un
 * desplazamiento del rango cuando la mueve el scroll. En una línea de tiempo de
 * scroll «medio segundo» no significa nada — lo que existe es el avance.
 */
export function InViewReveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  /** Segundos. Para escalonar elementos hermanos. */
  delay?: number;
  /** Cuánto sube el bloque al entrar, en píxeles. */
  y?: number;
}) {
  const style = {
    "--reveal-delay": `${delay}s`,
    "--reveal-y": `${y}px`,
    // 6 puntos porcentuales por cada 0.08 s de retraso: el mismo escalonado
    // percibido cuando la animación la mueve el scroll.
    ...(delay ? { "--reveal-shift": `${Math.min(delay * 75, 25)}%` } : {}),
  } as CSSProperties;

  return (
    <div className={className ? `reveal ${className}` : "reveal"} style={style}>
      {children}
    </div>
  );
}
