export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-carbon/10 rounded-xl border border-carbon/10 bg-warm-white">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          {/* El `<h2>` dentro del `<summary>` es lo que da estructura a la
              página. Sin él, `/preguntas-frecuentes` renderiza 0 encabezados:
              funciona con teclado, pero ni un buscador ni la navegación por
              encabezados de un lector de pantalla ven las preguntas. Envolver
              en lugar de sustituir mantiene intacto el comportamiento nativo
              de details/summary. */}
          <summary className="flex cursor-pointer list-none items-center justify-between marker:content-none">
            <h2 className="font-medium">{item.q}</h2>
            <span aria-hidden className="ml-4 text-orange-ink transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-gray">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
