import { clsx } from "clsx";

/**
 * Los puntos de posición de una cinta.
 *
 * QUÉ RESUELVEN
 *
 * En móvil las experiencias van en cinta horizontal. La única pista de que hay
 * más era el trocito de la tarjeta siguiente asomando por el borde: sirve para
 * intuir que algo continúa, pero no para saber **cuántas** hay ni por dónde vas.
 * Con tres o más tarjetas eso deja de ser un detalle.
 *
 * POR QUÉ NO SON PESTAÑAS
 *
 * Este componente declaraba `role="tablist"` y `role="tab"`. Un `tab` promete un
 * `tabpanel` al que gobierna, y aquí no hay ninguno: las tarjetas no aparecen y
 * desaparecen, están todas a la vez y lo que cambia es dónde mira la cinta. Un
 * lector de pantalla anunciaría «pestaña 2 de 3» sobre algo que no se comporta
 * como una pestaña.
 *
 * Lo correcto para «este es el elemento actual de un conjunto» es
 * `aria-current`. Los puntos siguen siendo botones de verdad —se pueden pulsar
 * y tabular— pero prometen solo lo que cumplen.
 *
 * El área táctil es de 44 px aunque el punto se dibuje de 6: el punto es la
 * pintura, el botón es el objetivo.
 */
export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  label = "experiencia",
  className,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === activeIndex ? "true" : undefined}
          aria-label={`Ir a ${label} ${i + 1} de ${count}`}
          onClick={() => onSelect(i)}
          className="group flex size-11 items-center justify-center"
        >
          <span
            aria-hidden
            className={clsx(
              "h-1.5 rounded-full transition-all duration-[var(--motion-collapse)] ease-sunny",
              i === activeIndex ? "w-6 bg-carbon" : "w-1.5 bg-carbon/25 group-hover:bg-carbon/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
