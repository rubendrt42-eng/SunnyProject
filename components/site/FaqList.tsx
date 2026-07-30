export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-carbon/10 rounded-2xl border border-carbon/10 bg-warm-white">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium marker:content-none">
            {item.q}
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
