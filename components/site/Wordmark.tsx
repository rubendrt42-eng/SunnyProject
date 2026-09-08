/**
 * LA MARCA ESCRITA — Sun-i project®
 *
 * PROVISIONAL, Y EN UN SOLO SITIO A PROPÓSITO
 *
 * La identidad oficial es un PNG (481×130) que todavía no está en el
 * repositorio. Mientras llega, esto reproduce la marca en CSS: la píldora con
 * el gradiente firma y el nombre en Poppins coral, que es exactamente lo que
 * es el logo — no hay ilustración que imitar, es tipografía sobre un fondo.
 *
 * Vive aislado en este componente para que sustituirlo sea cambiar el cuerpo
 * de la función por un `<Image>` y nada más. Ningún otro archivo del sitio
 * escribe la marca a mano; todos pasan por aquí.
 *
 * La especificación de marca dice «nunca rediseñar ni recolorear el logo», así
 * que esto NO es una reinterpretación: es un marcador de posición fiel que se
 * retira en cuanto exista el archivo.
 *
 * SOBRE EL CONTRASTE
 *
 * El coral de marca da 3.74:1 sobre blanco. Aquí eso es suficiente porque el
 * nombre se dibuja a cuerpo grande y en peso 700 —AA pide 3:1 para eso— y
 * además el fondo es la parte clara del gradiente, no blanco puro.
 */
export function Wordmark({
  className = "",
  /** En fondos oscuros el gradiente no funciona: la marca va en claro y plana. */
  tono = "color",
}: {
  className?: string;
  tono?: "color" | "claro";
}) {
  if (tono === "claro") {
    return (
      <span
        className={`font-display text-[1.05rem] leading-none font-bold tracking-[-0.02em] text-warm-white ${className}`}
      >
        Sun-i project
        <span className="ml-0.5 align-super text-[0.5em] font-medium">®</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-pill px-4 py-2 font-display text-[1.05rem] leading-none font-bold tracking-[-0.02em] text-coral ${className}`}
      style={{ backgroundImage: "var(--gradient-sun)" }}
    >
      Sun-i project
      <span className="ml-0.5 align-super text-[0.5em] font-medium">®</span>
    </span>
  );
}
