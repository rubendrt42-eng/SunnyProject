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
 * Discretos y en una esquina, pero SIEMPRE COMPLETOS. Asomar medio cuerpo por
 * el borde parecía buena idea y no lo era: una ilustración cortada no se lee
 * como que se sale del cuadro, se lee como que está mal puesta.
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
/**
 * SOLO LA PAREJA, Y NO POR PEREZA.
 *
 * Hubo también una estrella y un sol sueltos, recortados de la misma
 * ilustración. No servían: en el original los dos van de la mano y cada uno
 * tapa un trozo del otro, así que al separarlos la estrella se quedaba sin el
 * brazo derecho y el sol arrastraba un pedazo del cuerpo de la estrella.
 * Salían figuras incompletas, y se notaba.
 *
 * Para tenerlos por separado hacen falta los archivos originales de cada uno,
 * o redibujarlos en vectorial. Hasta entonces, una pieza buena antes que tres
 * malas.
 */
const PERSONAJES = {
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
