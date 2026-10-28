import Image from "next/image";
import { sanityLoader } from "@/lib/sanity/loader";
import type { ImagenSunni } from "@/lib/sanity/types";

/**
 * LAS FOTOGRAFÍAS DE SUN-I.
 *
 * Son de Emmy, de sus propias activaciones. Vienen recortadas: en el original
 * aparecía el rótulo «Feelgood hub» —la marca que el proyecto tuvo que dejar
 * por el tema de propiedad intelectual— y en las tres estaba en la franja
 * superior, así que se va con el encuadre. No hubo que tapar ni retocar nada.
 *
 * Viven en el repositorio y no en el gestor de contenido porque hoy son dos
 * piezas fijas de la portada, no contenido que cambie. El día que Emmy quiera
 * cambiarlas sin avisar, suben a Sanity como el resto.
 */
const FOTOS = {
  /*
    El archivo cambió de nombre al pasar del recorte al encuadre completo, y
    no por gusto: el optimizador de imágenes de Next cachea por URL. Con el
    mismo nombre seguía sirviendo la versión recortada aunque el archivo en
    disco ya fuera otro —pasó, y durante un rato parecía que el cambio no se
    había aplicado—. Nombre nuevo, caché nueva.
  */
  clase: {
    src: "/media/sunni/sunni-clase-completa.webp",
    alt: "Clase de yoga al aire libre, un grupo en postura de triángulo sobre tapetes de colores",
  },
  maquina: {
    src: "/media/sunni/sunni-maquina.webp",
    alt: "Una mujer frente a una unidad Sun‑i amarilla, eligiendo producto, rodeada de un muro verde",
  },
  /*
    La única de las cuatro que llegó sin el rótulo de la marca anterior: la
    unidad va rotulada «the SUNNI PROJECT». Por eso entra con el encuadre
    completo, sin recortar y sin retocar — solo escalada y comprimida, que es
    obligatorio para servirla por web.

    Es un render, no una fotografía: las etiquetas de los productos no son
    legibles de cerca. A la escala en que se muestra se lee como lo que es,
    una propuesta de cómo se vería la unidad rotulada.
  */
  parque: {
    /*
      Archivo nuevo, nombre nuevo. El optimizador de Next cachea por URL:
      cambiar el contenido dejando el mismo nombre ya nos costó un rato de
      creer que el cambio no se aplicaba. El anterior se queda en el
      repositorio por si hace falta volver.
    */
    src: "/media/sunni/sunni-parque-v2.webp",
    alt: "Render de una unidad Sun\u2011i rotulada con cielo azul en un parque, una persona eligiendo en la pantalla",
  },
  circulo: {
    src: "/media/sunni/sunni-circulo.webp",
    alt: "Grupo sentado en círculo sobre tapetes escuchando a una facilitadora, junto a una unidad Sun‑i",
  },
} as const;

export function Foto({
  cual,
  deSanity,
  proporcion = "aspect-[4/5]",
  prioridad = false,
  className = "",
}: {
  cual: keyof typeof FOTOS;
  /**
   * La imagen que Emmy subió al Studio, si la hay. Manda sobre la del
   * repositorio; vacía o sin archivo, se usa la de aquí. Vaciar una imagen en
   * Sanity nunca deja un hueco.
   */
  deSanity?: ImagenSunni | null;
  proporcion?: string;
  /** Solo para la del hero: es la imagen más grande de la primera pantalla. */
  prioridad?: boolean;
  className?: string;
}) {
  const f = FOTOS[cual];
  const url = deSanity?.url?.trim();
  const desdeSanity = Boolean(url);

  /*
    EL PUNTO DE RECORTE.

    Cada hueco tiene una forma fija y la foto se recorta con `object-cover`.
    Por defecto el navegador recorta por el centro, y una foto cuya cara está
    arriba a la izquierda pierde justo la cara.

    Sanity guarda el punto que Emmy marca en el Studio (0..1); aquí se
    traduce a `object-position`. Sin marcar, queda el centro de siempre.
  */
  const foco =
    desdeSanity && typeof deSanity?.hx === "number" && typeof deSanity?.hy === "number"
      ? { objectPosition: `${Math.round(deSanity.hx * 100)}% ${Math.round(deSanity.hy * 100)}%` }
      : undefined;

  return (
    <div className={`relative overflow-clip rounded-2xl bg-cream ${proporcion} ${className}`}>
      <Image
        src={url ?? f.src}
        // La descripción también se puede cambiar desde Sanity. Si se deja
        // vacía queda la del código, que está escrita y revisada: una imagen
        // sin descripción es una imagen que no existe para quien no la ve.
        alt={deSanity?.alt?.trim() || f.alt}
        {...(desdeSanity ? { loader: sanityLoader } : {})}
        {...(desdeSanity && deSanity?.lqip ? { placeholder: "blur" as const, blurDataURL: deSanity.lqip } : {})}
        style={foco}
        fill
        priority={prioridad}
        sizes="(min-width: 1024px) 42vw, 100vw"
        /*
          `parallax` mueve la fotografía algo más despacio que la columna de
          texto al hacer scroll. Va sobre la imagen y nunca sobre el
          contenedor: el contenedor recorta, así que el desplazamiento no
          empuja nada y no puede crear scroll horizontal.

          El sistema lo limita a ±4% con una escala del 1.09 para que el
          desplazamiento no descubra el borde. Más que eso se nota como truco.
        */
        className="parallax object-cover"
      />
    </div>
  );
}
