import Image from "next/image";

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
  clase: {
    src: "/media/sunni/sunni-clase.webp",
    alt: "Clase de yoga al aire libre, un grupo en postura de triángulo sobre tapetes de colores",
  },
  maquina: {
    src: "/media/sunni/sunni-maquina.webp",
    alt: "Una mujer frente a una unidad Sun‑i amarilla, eligiendo producto, rodeada de un muro verde",
  },
  circulo: {
    src: "/media/sunni/sunni-circulo.webp",
    alt: "Grupo sentado en círculo sobre tapetes escuchando a una facilitadora, junto a una unidad Sun‑i",
  },
} as const;

export function Foto({
  cual,
  proporcion = "aspect-[4/5]",
  prioridad = false,
  className = "",
}: {
  cual: keyof typeof FOTOS;
  proporcion?: string;
  /** Solo para la del hero: es la imagen más grande de la primera pantalla. */
  prioridad?: boolean;
  className?: string;
}) {
  const f = FOTOS[cual];
  return (
    <div className={`relative overflow-clip rounded-2xl bg-cream ${proporcion} ${className}`}>
      <Image
        src={f.src}
        alt={f.alt}
        fill
        priority={prioridad}
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
