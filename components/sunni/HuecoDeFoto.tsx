/**
 * EL SITIO DE UNA FOTOGRAFÍA QUE TODAVÍA NO EXISTE.
 *
 * La especificación de Sun-i pide cinco fotografías —hero, máquina, producto,
 * comunidad y experiencias— y ninguna está: las que había en la versión de
 * Lovable las generó una IA y Emmy dijo expresamente que no le gustan. Va a
 * mandar las suyas.
 *
 * Mientras tanto esto NO es un placeholder gris. Un rectángulo vacío se lee
 * como un error de carga; esto se lee como una decisión: el gradiente firma
 * muy desaturado, el grano de siempre y una nota de lo que va a ir ahí. El
 * hueco está dimensionado con la proporción final, así que el día que llegue
 * la fotografía se cambia el contenido y la maquetación no se entera.
 */
export function HuecoDeFoto({
  proporcion = "aspect-[4/5]",
  nota,
  className = "",
}: {
  proporcion?: string;
  /** Qué fotografía va aquí. Se lee en pantalla, en voz baja. */
  nota: string;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate overflow-clip rounded-2xl border border-ink/8 ${proporcion} ${className}`}
      style={{ backgroundImage: "var(--gradient-sun)" }}
    >
      {/* El gradiente a plena saturación compite con todo lo demás. Muy lavado
          se lee como superficie, que es lo que un hueco debe ser. */}
      <div aria-hidden className="absolute inset-0 bg-warm-white/72" />
      <div aria-hidden className="hero-grain absolute inset-0 opacity-[0.07]" />
      <p className="absolute right-6 bottom-6 left-6 text-right text-[0.7rem] tracking-[0.14em] text-ink/35 uppercase">
        {nota}
      </p>
    </div>
  );
}
