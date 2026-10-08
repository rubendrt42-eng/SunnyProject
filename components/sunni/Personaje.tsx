import Image from "next/image";

/**
 * LOS PERSONAJES DE SUN-I.
 *
 * Son los dibujos de Emmy, los mismos que usa en Instagram. Llegaron en PNG
 * con fondo transparente; lo único que se les hizo fue quitar el margen
 * completamente transparente que traían alrededor —nada visible— para poder
 * darles una altura sin que el dibujo quedara nadando dentro de su caja.
 *
 * VAN COMO DECORACIÓN, NO COMO CONTENIDO.
 *
 * De ahí `alt=""` y `aria-hidden`: no dicen nada que el titular de al lado no
 * diga ya. Un lector de pantalla que los anunciara —«imagen de un sol
 * corriendo»— solo metería ruido entre el rótulo y el titular. La regla es
 * vieja y simple: si quitar la imagen no te hace perder información, no lleva
 * texto alternativo.
 *
 * `priority` nunca: ninguno está en la primera pantalla.
 */
const PERSONAJES = {
  /** El sol corriendo. Para los momentos de impulso: el cierre. */
  sol: { src: "/media/sunni/personaje-sol.png", ancho: 506, alto: 560 },
  /** La cara en calma, ojos cerrados. Para presentar la marca. */
  cara: { src: "/media/sunni/personaje-cara.png", ancho: 542, alto: 560 },
} as const;

export function Personaje({
  cual,
  /**
   * `gira` entra ladeado y se endereza con el scroll — para el sol, que ya
   * tiene postura de carrera. `late` entra pequeño y crece — para la cara,
   * que está quieta y pide un gesto más tranquilo.
   */
  movimiento = "gira",
  className = "",
}: {
  cual: keyof typeof PERSONAJES;
  movimiento?: "gira" | "late";
  className?: string;
}) {
  const p = PERSONAJES[cual];
  return (
    <Image
      src={p.src}
      alt=""
      aria-hidden
      width={p.ancho}
      height={p.alto}
      sizes="160px"
      className={`personaje personaje--${movimiento} w-auto select-none ${className}`}
    />
  );
}
