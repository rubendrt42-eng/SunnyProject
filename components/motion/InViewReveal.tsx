import type { CSSProperties, ReactNode } from "react";

/**
 * Revelado al entrar en pantalla, **sin JavaScript**.
 *
 * QUÉ ERA ANTES Y POR QUÉ CAMBIÓ (DOS VECES)
 *
 * Primero fue un componente de cliente con la librería de animación. Salía del
 * servidor con `opacity:0` en línea, así que si el JavaScript no llegaba, la
 * página se veía vacía. Eso se arregló pasándolo a CSS.
 *
 * Pero la primera versión en CSS tenía un solo revelado para todo: 31 bloques
 * subiendo los mismos 16 px con el mismo desvanecido, en una ventana tan larga
 * que el elemento terminaba de aparecer cuando aún estaba en el borde inferior
 * de la pantalla. Técnicamente había movimiento; en la práctica, al bajar por
 * la página no pasaba nada.
 *
 * Ahora hay tres papeles, porque un titular no entra como una fotografía:
 *
 * - `"bloque"` (por defecto) — texto y contenedores. Sube y aparece.
 * - `"lead"` — el titular que abre una sección. Sube más y desde más lejos.
 * - `"media"` — fotografía y lienzos. Entra desde una escala mayor y
 *   revelándose desde abajo con un recorte, que es lo que hace que una imagen
 *   se sienta colocada en vez de encendida.
 *
 * Las tres terminan en el estado visible pase lo que pase.
 */
export function InViewReveal({
  children,
  className,
  delay = 0,
  y,
  variant = "bloque",
}: {
  children: ReactNode;
  className?: string;
  /** Segundos de escalonado entre hermanos. */
  delay?: number;
  /** Cuánto sube, en píxeles. Sin valor, lo decide el papel. */
  y?: number;
  variant?: "bloque" | "lead" | "media";
}) {
  const clase = [
    "reveal",
    variant === "media" && "reveal--media",
    variant === "lead" && "reveal--lead",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ...(delay ? { "--reveal-delay": `${delay}s` } : {}),
    ...(y !== undefined ? { "--reveal-y": `${y}px` } : {}),
    /**
     * El escalonado cuando lo mueve el scroll no se puede expresar en segundos:
     * en una línea de tiempo de posición lo que existe es el avance. 0.08 s de
     * retraso equivalen a unos 6 puntos de rango, y se aplica a los dos
     * extremos para que la ventana no se acorte.
     *
     * EL TOPE ES 15 Y NO ES UN NÚMERO REDONDO CUALQUIERA.
     *
     * El rango termina en `entry 85% + escalonado`, y `entry` solo llega a
     * 100%: con un escalonado de 22 el final caía en 107%, o sea fuera. La
     * animación no terminaba nunca y el bloque se quedaba al 88 % de opacidad
     * para siempre, ya completamente a la vista. Se veía como un texto
     * desvaído —y en gris sobre crema baja del contraste mínimo—, no como un
     * revelado. 85 + 15 = 100: el último escalón acaba justo al completar la
     * entrada, que es lo que dice el comentario del rango en `globals.css`.
     */
    ...(delay ? { "--reveal-shift": `${Math.min(delay * 75, 15)}%` } : {}),
  } as CSSProperties;

  return (
    <div className={clase} style={style}>
      {children}
    </div>
  );
}
