import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { clsx } from "clsx";
import { AlertTriangle, CalendarOff, ChevronDown, SearchX, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublicExperiences, getActiveWeeklyReservation, getUserReservationHistory } from "@/lib/queries";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { determineCta } from "@/lib/experience-cta";
import { listAvailableDemoAssets } from "@/lib/assets.server";
import { CatalogGrid } from "@/components/experience/CatalogGrid";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES } from "@/lib/constants";
import { computeExperienceState } from "@/lib/experience-status";
import { isArchived, isOriginal, socialModesOf } from "@/lib/experience-flags";
import { INTENT_KEYS, INTENTS, isIntent, matchesIntent } from "@/lib/social-modes";
import { isPast } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Experiencias — Sunny Project" };

type Availability = "cualquiera" | "disponibles" | "agotadas";

interface CatalogParams {
  categoria?: string;
  disponibilidad?: Availability;
  intencion?: string;
  tipo?: string;
  negocio?: string;
  q?: string;
  ver?: string;
}

export default async function ExperienciasPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  const { categoria, disponibilidad, intencion, tipo, negocio, q } = params;

  const supabase = await createClient();
  const user = await getCurrentUser();
  const [{ data: experiences, error: queryError }, activeWeekly, history] = await Promise.all([
    getPublicExperiences(supabase),
    user ? getActiveWeeklyReservation(supabase, user.id) : Promise.resolve(null),
    user ? getUserReservationHistory(supabase, user.id) : Promise.resolve([]),
  ]);
  const availableAssets = listAvailableDemoAssets();

  const needle = q?.trim().toLowerCase();
  const activeIntent = isIntent(intencion) ? intencion : null;

  /**
   * Public visibility rules (brief §32): archived experiences never appear,
   * and neither do experiences whose date has passed — a finished plan shown
   * among this week's list would read as bookable. Cancelled ones stay
   * visible until their date passes so somebody holding a pass can still
   * find the page and see that it was cancelled.
   */
  const visible = experiences.filter((e) => !isArchived(e) && !isPast(e.starts_at));

  const filtered = visible.filter((e) => {
    if (categoria && e.category !== categoria) return false;
    if (negocio && e.business.slug !== negocio) return false;
    if (tipo === "originals" && !isOriginal(e)) return false;
    if (activeIntent && !matchesIntent({ category: e.category, socialModes: socialModesOf(e) }, activeIntent)) return false;
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

  /**
   * Ordering (brief §24): featured first, then everything else by date, with
   * sold-out pulled out to a separate block at the end instead of being
   * scattered through the bookable list.
   */
  const bookable = filtered.filter((e) => computeExperienceState(e, e.reserved_count) !== "sold_out");
  const soldOut = filtered.filter((e) => computeExperienceState(e, e.reserved_count) === "sold_out");
  const byDate = (a: { starts_at: string }, b: { starts_at: string }) =>
    new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();

  const sortedBookable = [...bookable].sort(byDate);
  const featured = sortedBookable.find((e) => e.featured) ?? sortedBookable[0] ?? null;
  const rest = sortedBookable.filter((e) => e.id !== featured?.id);
  const sortedSoldOut = [...soldOut].sort(byDate);

  const reservedExperienceIds = new Set(
    history.filter((r) => r.status === "confirmed" || r.status === "attended" || r.status === "no_show").map((r) => r.experience_id),
  );

  const ctaByExperienceId: Record<string, ReturnType<typeof determineCta>["type"]> = {};
  for (const experience of filtered) {
    ctaByExperienceId[experience.id] = determineCta({
      experience,
      isAuthenticated: Boolean(user),
      isProfileComplete: isProfileComplete(user?.profile ?? null),
      hasReservationForThisExperience: reservedExperienceIds.has(experience.id),
      hasActivePassElsewhere: Boolean(activeWeekly) && activeWeekly?.experience_id !== experience.id,
    }).type;
  }

  const hasOriginals = visible.some(isOriginal);
  const hasActiveFilters = Boolean(
    categoria || negocio || tipo || activeIntent || (disponibilidad && disponibilidad !== "cualquiera") || q,
  );
  const businessName = negocio ? visible.find((e) => e.business.slug === negocio)?.business.name : null;

  /**
   * How many filters are hidden inside "Más filtros". Shown as a count on the
   * summary so an active filter is never invisible just because the panel is
   * collapsed — `categoria` is excluded because its chips stay on screen.
   */
  const advancedFilterCount = [
    activeIntent,
    disponibilidad && disponibilidad !== "cualquiera" ? disponibilidad : null,
    tipo,
    negocio,
    q,
  ].filter(Boolean).length;

  /** Preserves every other filter (and drops `ver`, which is panel state, not a filter). */
  function buildHref(next: Partial<CatalogParams>) {
    const merged: CatalogParams = { categoria, disponibilidad, intencion, tipo, negocio, q, ...next };
    const search = new URLSearchParams();
    if (merged.categoria) search.set("categoria", merged.categoria);
    if (merged.disponibilidad && merged.disponibilidad !== "cualquiera") search.set("disponibilidad", merged.disponibilidad);
    if (merged.intencion) search.set("intencion", merged.intencion);
    if (merged.tipo) search.set("tipo", merged.tipo);
    if (merged.negocio) search.set("negocio", merged.negocio);
    if (merged.q) search.set("q", merged.q);
    const qs = search.toString();
    return qs ? `/experiencias?${qs}` : "/experiencias";
  }

  return (
    <main className="pb-20">
      <Container className="pt-14 sm:pt-20">
        <p className="eyebrow">Explora Monterrey</p>
        <h1 className="mt-3 max-w-3xl text-display">Experiencias para salir de la rutina.</h1>
        <p className="mt-5 max-w-xl text-body-l text-gray">
          Movimiento, recovery, cafés, outdoor y comunidad. Elige una y utiliza tu pase semanal.
        </p>
        {!queryError && visible.length > 0 && (
          <p aria-live="polite" className="mt-5 text-small text-gray">
            {filtered.length} {filtered.length === 1 ? "experiencia" : "experiencias"}
            {businessName ? ` de ${businessName}` : ""}
            {activeIntent ? ` para "${INTENTS[activeIntent].question.toLowerCase()}"` : ""}
          </p>
        )}
      </Container>

      {/* Filters stay server-rendered links so the catalogue is fully
          usable and crawlable without JavaScript.

          ONE row is sticky, the rest lives inside a <details>. The bar used
          to pin four stacked rows — intención, categoría, disponibilidad and
          the search form — which measured 290 px. Added to the 73 px header
          that is **363 px of every viewport occupied permanently**: 40% at
          1440×900 and 45% at 375×812, so the catalogue was always read
          through a slot barely half a screen tall and the first card started
          at y=828. The whole point of this page is to look at experiences.

          <details> and not a toggle component on purpose: it opens with no
          JavaScript, so the "usable without JS" property above survives. */}
      <div className="sticky top-18 z-30 mt-8 border-y border-carbon/10 bg-ivory/95 py-3 backdrop-blur">
        <Container className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <nav aria-label="Filtrar por categoría" className="no-scrollbar flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto">
              <FilterChip href={buildHref({ categoria: undefined })} active={!categoria} label="Todas" />
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c.value}
                  href={buildHref({ categoria: categoria === c.value ? undefined : c.value })}
                  active={categoria === c.value}
                  label={c.label}
                />
              ))}
            </nav>

            {hasActiveFilters && (
              <Link
                href="/experiencias"
                className="hidden shrink-0 text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon sm:inline"
              >
                Limpiar
              </Link>
            )}
          </div>

          <details className="group">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-2 text-small font-medium text-carbon/75 hover:text-carbon">
              <SlidersHorizontal aria-hidden size={15} strokeWidth={1.75} />
              Más filtros
              {advancedFilterCount > 0 && (
                <span className="rounded-full bg-carbon px-1.5 text-label font-semibold text-warm-white">
                  {advancedFilterCount}
                </span>
              )}
              <ChevronDown aria-hidden size={15} strokeWidth={1.75} className="transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-3 flex flex-col gap-3 border-t border-carbon/10 pt-3">
              <FilterRow label="¿Qué buscas?">
                <FilterChip href={buildHref({ intencion: undefined })} active={!activeIntent} label="Todo" />
                {INTENT_KEYS.map((key) => (
                  <FilterChip
                    key={key}
                    href={buildHref({ intencion: activeIntent === key ? undefined : key })}
                    active={activeIntent === key}
                    label={INTENTS[key].label}
                  />
                ))}
              </FilterRow>

              <FilterRow label="Disponibilidad">
                {(
                  [
                    { value: "cualquiera", label: "Cualquier estado" },
                    { value: "disponibles", label: "Con cupo" },
                    { value: "agotadas", label: "Agotadas" },
                  ] as { value: Availability; label: string }[]
                ).map((a) => (
                  <FilterChip
                    key={a.value}
                    href={buildHref({ disponibilidad: a.value })}
                    active={(disponibilidad ?? "cualquiera") === a.value}
                    label={a.label}
                  />
                ))}
                {hasOriginals && (
                  <FilterChip
                    href={buildHref({ tipo: tipo === "originals" ? undefined : "originals" })}
                    active={tipo === "originals"}
                    label="Sunny Originals"
                  />
                )}
              </FilterRow>

              <div className="flex flex-wrap items-center gap-3">
                <form method="get" className="flex flex-1 items-center gap-2">
                  {categoria && <input type="hidden" name="categoria" value={categoria} />}
                  {disponibilidad && <input type="hidden" name="disponibilidad" value={disponibilidad} />}
                  {intencion && <input type="hidden" name="intencion" value={intencion} />}
                  {tipo && <input type="hidden" name="tipo" value={tipo} />}
                  {negocio && <input type="hidden" name="negocio" value={negocio} />}
                  <label htmlFor="q" className="sr-only">
                    Buscar experiencias
                  </label>
                  <input
                    id="q"
                    name="q"
                    type="search"
                    defaultValue={q ?? ""}
                    placeholder="Buscar por nombre, negocio o zona…"
                    className="h-11 w-full max-w-xs rounded-md border border-carbon/20 bg-warm-white px-4 text-small focus:border-carbon"
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-md border border-carbon/20 px-4 text-small font-medium transition-colors hover:border-carbon"
                  >
                    Buscar
                  </button>
                </form>
                {hasActiveFilters && (
                  <Link
                    href="/experiencias"
                    className="text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
                  >
                    Limpiar filtros
                  </Link>
                )}
              </div>
            </div>
          </details>
        </Container>
      </div>

      <Container className="mt-10">
        {queryError ? (
          <EmptyState
            icon={AlertTriangle}
            title="No pudimos cargar las experiencias"
            description="Hubo un problema al consultar el catálogo. Vuelve a intentarlo en un momento."
            action={
              <Link href="/experiencias" className="text-small font-semibold text-carbon underline decoration-carbon/30 underline-offset-4">
                Reintentar
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            title="Aún no hay experiencias publicadas"
            description="Publicamos experiencias nuevas cada semana. Vuelve pronto."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No encontramos experiencias con estos filtros"
            description="Prueba con otra intención o categoría, o mira todo el catálogo."
            action={
              <Link href="/experiencias" className="text-small font-semibold text-carbon underline decoration-carbon/30 underline-offset-4">
                Ver todas las experiencias
              </Link>
            }
          />
        ) : (
          // useSearchParams inside CatalogGrid needs a Suspense boundary on
          // a dynamically-rendered page.
          <Suspense fallback={<div className="h-96" aria-hidden />}>
            <CatalogGrid
              featured={featured}
              rest={rest}
              soldOut={sortedSoldOut}
              ctaByExperienceId={ctaByExperienceId}
              availableAssets={availableAssets}
            />
          </Suspense>
        )}
      </Container>
    </main>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label text-gray">{label}</span>
      <nav aria-label={`Filtrar por ${label.toLowerCase()}`} className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto pb-1">
        {children}
      </nav>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={clsx(
        "flex min-h-9 shrink-0 items-center rounded-full border px-4 text-small font-medium transition-colors",
        active ? "border-carbon bg-sunny text-carbon" : "border-carbon/15 text-carbon/75 hover:border-carbon hover:text-carbon",
      )}
    >
      {label}
    </Link>
  );
}
