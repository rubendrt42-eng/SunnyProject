import Image from "next/image";

/**
 * LOS PERSONAJES DE LA MARCA, EN LAS ORILLAS.
 *
 * La estrella y el sol son las ilustraciones que Emmy usa en Instagram. Se
 * recortaron de una publicación suya: el fondo era un degradado horizontal
 * puro —desviación vertical de 0.0 medida en el archivo— así que se pudo
 * modelar columna a columna y restarlo, en vez de recortar a mano. El color
 * del borde va descontaminado para que no quede halo naranja sobre el blanco
 * cálido del sitio.
 *
 * CÓMO SE COLOCAN, Y POR QUÉ ASÍ
 *
 * Asomados por el borde, nunca enteros ni centrados. Son un guiño al pasar,
 * no una ilustración que hay que mirar: si se colocan completos y en medio
 * piden atención y compiten con el texto, que es lo que la página acaba de
 * dejar de hacer.
 *
 * Tres reglas que no se rompen:
 *
 *   · `aria-hidden` y sin texto alternativo — no comunican nada que el copy no
 *     diga ya, y un lector de pantalla no debería anunciarlos.
 *   · `pointer-events-none` — jamás se comen un clic de un botón.
 *   · La sección que los aloja recorta con `overflow-clip`, así que un
 *     personaje que se sale por el borde no puede crear scroll horizontal.
 *
 * Se ocultan por debajo de `sm`: en un teléfono el ancho es del contenido.
 */
const PERSONAJES = {
  estrella: { src: "/media/sunni/sunni-estrella.webp", w: 621, h: 816 },
  sol: { src: "/media/sunni/sunni-sol.webp", w: 642, h: 833 },
  par: { src: "/media/sunni/sunni-par.webp", w: 700, h: 480 },
} as const;

export function Personaje({
  quien,
  className = "",
  ancho = 200,
}: {
  quien: keyof typeof PERSONAJES;
  /** Posición. La da quien lo coloca, porque depende de la sección. */
  className?: string;
  /** Ancho dibujado en píxeles CSS. */
  ancho?: number;
}) {
  const p = PERSONAJES[quien];
  return (
    <Image
      src={p.src}
      alt=""
      aria-hidden
      width={p.w}
      height={p.h}
      style={{ width: ancho, height: "auto" }}
      className={`pointer-events-none absolute select-none ${className}`}
    />
  );
}
