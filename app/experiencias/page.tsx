import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/server";
import { getPublicExperiences } from "@/lib/queries";
import { listAvailableDemoAssets } from "@/lib/assets.server";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { FeaturedExperienceCard } from "@/components/experience/FeaturedExperienceCard";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/lib/constants";
import { computeExperienceState } from "@/lib/experience-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Experiencias — Sunny Project" };

type Availability = "cualquiera" | "disponibles" | "agotadas";

export default async function ExperienciasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; disponibilidad?: Availability; q?: string }>;
}) {
  const { categoria, disponibilidad, q } = await searchParams;

  const supabase = await createClient();
  const { data: experiences, error: queryError } = await getPublicExperiences(supabase);
  const availableAssets = listAvailableDemoAssets();

  const needle = q?.trim().toLowerCase();

  const filtered = experiences.filter((e) => {
    if (categoria && e.category !== categoria) return false;
    if (disponibilidad && disponibilidad !== "cualquiera") {
      const state = computeExperienceState(e, e.reserved_count);
      if (disponibilidad === "disponibles" && !(state === "available" || state === "low")) return false;
      if (disponibilidad === "agotadas" && state !== "sold_out") return false;
    }
    if (needle) {
      const haystack = `${e.title} ${e.business.name} ${e.location_name ?? ""}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const featured = filtered.find((e) => e.featured) ?? filtered[0];
  const rest = filtered.filter((e) => e.id !== featured?.id);

  const categoryFilters: { value: string; label: string }[] = [{ value: "", label: "Todas" }, ...CATEGORIES];
  const availabilityFilters: { value: Availability; label: string }[] = [
    { value: "cualquiera", label: "Cualquier estado" },
    { value: "disponibles", label: "Con cupo" },
    { value: "agotadas", label: "Agotadas" },
  ];

  const hasActiveFilters = Boolean(categoria || (disponibilidad && disponibilidad !== "cualquiera") || q);

  function buildHref(next: { categoria?: string; disponibilidad?: string }) {
    const params = new URLSearchParams();
    const c = next.categoria ?? categoria;
    const d = next.disponibilidad ?? disponibilidad;
    if (c) params.set("categoria", c);
    if (d && d !== "cualquiera") params.set("disponibilidad", d);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/experiencias?${qs}` : "/experiencias";
  }

  return (
    <main className="pb-20">
      <Container className="pt-14 sm:pt-20">
        <p className="text-sm font-semibold tracking-widest text-orange uppercase">Explora Monterrey</p>
        <h1 className="mt-2 text-5xl leading-[1.03] font-semibold text-balance sm:text-6xl lg:text-7xl">
          Experiencias para salir de la rutina.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray">
          Movimiento, recovery, cafés, outdoor y comunidad. Elige una y utiliza tu pase semanal.
        </p>
        {!queryError && experiences.length > 0 && (
          <p className="mt-4 text-sm text-gray">
            {filtered.length} {filtered.length === 1 ? "experiencia encontrada" : "experiencias encontradas"}
          </p>
        )}
      </Container>

      <div className="sticky top-18 z-30 mt-8 border-y border-carbon/10 bg-ivory/95 py-4 backdrop-blur">
        <Container className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide text-gray uppercase">Categoría</span>
            <nav aria-label="Filtrar por categoría" className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {categoryFilters.map((c) => (
                <Link
                  key={c.value || "todas"}
                  href={buildHref({ categoria: c.value })}
                  aria-current={(categoria ?? "") === c.value ? "true" : undefined}
                  className={clsx(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                    (categoria ?? "") === c.value ? "border-carbon bg-carbon text-warm-white" : "border-carbon/15 hover:border-carbon",
                  )}
                >
                  {c.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide text-gray uppercase">Disponibilidad</span>
            <nav aria-label="Filtrar por disponibilidad" className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {availabilityFilters.map((a) => (
                <Link
                  key={a.value}
                  href={buildHref({ disponibilidad: a.value })}
                  aria-current={(disponibilidad ?? "cualquiera") === a.value ? "true" : undefined}
                  className={clsx(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                    (disponibilidad ?? "cualquiera") === a.value ? "border-orange text-orange" : "border-carbon/15 text-gray hover:border-carbon",
                  )}
                >
                  {a.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <form method="get" className="flex flex-1 items-center gap-2">
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              {disponibilidad && <input type="hidden" name="disponibilidad" value={disponibilidad} />}
              <label htmlFor="q" className="sr-only">
                Buscar experiencias
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q ?? ""}
                placeholder="Buscar por nombre, negocio o zona…"
                className="w-full max-w-xs rounded-full border border-carbon/15 bg-warm-white px-4 py-2 text-sm focus:border-carbon"
              />
              <button type="submit" className="rounded-full border border-carbon/15 px-4 py-2 text-sm font-medium hover:border-carbon">
                Buscar
              </button>
            </form>
            {hasActiveFilters && (
              <Link href="/experiencias" className="text-sm font-medium text-orange hover:underline">
                Limpiar filtros
              </Link>
            )}
          </div>
        </Container>
      </div>

      <Container className="mt-10">
        {queryError ? (
          <div className="rounded-2xl border border-dashed border-carbon/20 p-12 text-center">
            <p className="font-serif text-2xl italic">Algo salió mal</p>
            <p className="mt-2 text-gray">No pudimos cargar las experiencias. Intenta nuevamente.</p>
            <Link href="/experiencias" className="mt-6 inline-block text-sm font-medium text-orange hover:underline">
              Reintentar →
            </Link>
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-carbon/20 p-12 text-center">
            <p className="font-serif text-2xl italic">Aún no hay experiencias publicadas.</p>
            <p className="mt-2 text-gray">Vuelve pronto — publicamos experiencias nuevas cada semana.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-carbon/20 p-12 text-center">
            <p className="font-serif text-2xl italic">No encontramos experiencias con estos filtros.</p>
            <p className="mt-2 text-gray">
              Intenta con otros filtros o{" "}
              <Link href="/experiencias" className="text-orange hover:underline">
                ve todas las experiencias
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured && <FeaturedExperienceCard experience={featured} availableAssets={availableAssets} />}
            {rest.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} availableAssets={availableAssets} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
