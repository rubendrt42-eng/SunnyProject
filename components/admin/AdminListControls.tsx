import Link from "next/link";
import { Search } from "lucide-react";
import type { Paged } from "@/lib/admin-list";
import { NavPending } from "@/components/admin/NavPending";

/**
 * Buscador y paginador de las listas del panel.
 *
 * Enlaces y un `<form method="get">`, no estado de cliente: así la búsqueda
 * queda en la URL y Emmy puede guardar o compartir «los negocios de Monterrey»
 * como cualquier otra dirección. Es el mismo criterio que ya sigue el catálogo
 * público.
 */

/** Los parámetros de la página que hay que conservar al buscar o pasar página. */
export type CarriedParams = Record<string, string | undefined>;

export function AdminSearch({
  placeholder,
  value,
  carry,
}: {
  placeholder: string;
  value?: string;
  /** Filtros activos que la búsqueda no debe borrar (estado, categoría…). */
  carry?: CarriedParams;
}) {
  return (
    <form method="get" className="mt-5 flex items-center gap-2">
      {Object.entries(carry ?? {}).map(([name, v]) =>
        v ? <input key={name} type="hidden" name={name} value={v} /> : null,
      )}
      <label htmlFor="admin-q" className="sr-only">
        {placeholder}
      </label>
      <div className="relative flex-1 sm:max-w-xs">
        <Search
          aria-hidden
          size={15}
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
        />
        <input
          id="admin-q"
          name="q"
          type="search"
          defaultValue={value ?? ""}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-neutral-300 bg-white pr-3 pl-9 text-small text-neutral-900 focus:border-neutral-900"
        />
      </div>
      <button
        type="submit"
        className="h-10 shrink-0 rounded-md border border-neutral-300 px-4 text-small font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
      >
        Buscar
      </button>
      {value && (
        <Link
          href="?"
          className="shrink-0 text-small font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
        >
          Limpiar
        </Link>
      )}
    </form>
  );
}

export function AdminPager<T>({ paged, carry, label }: { paged: Paged<T>; carry?: CarriedParams; label: string }) {
  const { page, totalPages, total, from, to } = paged;

  const href = (n: number) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(carry ?? {})) if (v) search.set(k, v);
    if (n > 1) search.set("page", String(n));
    const qs = search.toString();
    return qs ? `?${qs}` : "?";
  };

  // El recuento se muestra siempre, aunque quepa en una página: saber que son
  // 6 y no 600 es justo lo que se quiere saber de un vistazo.
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-small text-neutral-600">
      <p aria-live="polite">
        {total === 0 ? `Sin ${label}` : `${from}–${to} de ${total} ${label}`}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={href(page - 1)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 font-medium transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              Anterior
              <NavPending label="la página anterior" />
            </Link>
          )}
          <span className="px-1">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={href(page + 1)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 font-medium transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              Siguiente
              <NavPending label="la página siguiente" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
