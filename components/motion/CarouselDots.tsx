import { clsx } from "clsx";

export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  label = "experiencia",
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  label?: string;
}) {
  return (
    <div role="tablist" aria-label="Selecciona una experiencia destacada" className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Ver ${label} ${i + 1} de ${count}`}
          onClick={() => onSelect(i)}
          className={clsx(
            "h-1.5 rounded-full transition-all duration-[var(--motion-collapse)]",
            i === activeIndex ? "w-6 bg-carbon" : "w-1.5 bg-carbon/25 hover:bg-carbon/40",
          )}
        />
      ))}
    </div>
  );
}
