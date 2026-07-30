import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { CalendarPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminExperiences, type ExperienceWithStats } from "@/lib/admin-queries";
import {
  ADMIN_STATE_LABEL,
  ADMIN_STATE_TONE,
  computeAdminState,
  isArchived,
  isOriginal,
  maxPartySizeOf,
  type AdminExperienceState,
} from "@/lib/experience-flags";
import { Badge, OriginalSeal } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExperienceRowActions } from "@/components/admin/ExperienceRowActions";
import { formatDateShort, formatTime } from "@/lib/dates";
import { categoryLabel } from "@/lib/constants";
import { displayTitle } from "@/lib/demo-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Experiencias — Sunny Admin" };

const FILTERS = [
  { value: "activas", label: "Activas" },
  { value: "borradores", label: "Borradores" },
  { value: "publicadas", label: "Publicadas" },
  { value: "agotadas", label: "Agotadas" },
  { value: "finalizadas", label: "Finalizadas" },
  { value: "canceladas", label: "Canceladas" },
  { value: "archivadas", label: "Archivadas" },
  { value: "todas", label: "Todas" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

function matchesFilter(state: AdminExperienceState, filter: FilterValue): boolean {
  switch (filter) {
    case "activas":
      // The default view: what Emmy is actually running. Archived,
      // cancelled and finished experiences are kept but out of the way.
      return state === "draft" || state === "scheduled" || state === "published" || state === "sold_out";
    case "borradores":
      return state === "draft";
    case "publicadas":
      return state === "published" || state === "scheduled";
    case "agotadas":
      return state === "sold_out";
    case "finalizadas":
      return state === "completed";
    case "canceladas":
      return state === "cancelled";
    case "archivadas":
      return state === "archived";
    case "todas":
      return true;
  }
}

export default async function AdminExperienciasPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const filter: FilterValue = FILTERS.some((f) => f.value === estado) ? (estado as FilterValue) : "activas";

  const supabase = await createClient();
  const { experiences, error } = await getAdminExperiences(supabase);

  /**
   * Whether the presentation migration has run. Detected from the row shape
   * rather than guessed: if the column exists the key is present, even when
   * null. Drives whether the Original / Archive controls are offered at all
   * — better to hide a control than to show one that fails on click.
   */
  const supportsFlags = experiences.length > 0 && "archived_at" in experiences[0];

  const withState = experiences.map((e) => ({ experience: e, state: computeAdminState(e, e.reservedPeople) }));
  const visible = withState.filter(({ state }) => matchesFilter(state, filter));

  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.value, withState.filter(({ state }) => matchesFilter(state, f.value)).length]),
  ) as Record<FilterValue, number>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold sm:text-2xl">Experiencias</h1>
        <Link
          href="/admin/experiencias/nueva"
          className="flex min-h-10 items-center gap-2 rounded-md bg-neutral-900 px-4 text-small font-medium text-white hover:bg-neutral-800"
        >
          <CalendarPlus aria-hidden size={16} strokeWidth={1.5} />
          Nueva experiencia
        </Link>
      </div>

      {!supportsFlags && experiences.length > 0 && (
        <p className="mt-4 rounded-md border border-neutral-300 bg-white px-4 py-3 text-small text-neutral-600">
          Las acciones <strong>Sunny Original</strong> y <strong>Archivar</strong> aparecerán cuando se aplique la
          migración pendiente. Todo lo demás ya funciona.
        </p>
      )}

      <nav aria-label="Filtrar experiencias" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "activas" ? "/admin/experiencias" : `/admin/experiencias?estado=${f.value}`}
            aria-current={filter === f.value ? "true" : undefined}
            className={clsx(
              "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-small font-medium transition-colors",
              filter === f.value
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-white",
            )}
          >
            {f.label}
            <span className={filter === f.value ? "text-white/70" : "text-neutral-400"}>{counts[f.value]}</span>
          </Link>
        ))}
      </nav>

      {error ? (
        <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-small text-red-800">
          No pudimos cargar las experiencias.
        </p>
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6 border-neutral-300 bg-white"
          icon={CalendarPlus}
          title={experiences.length === 0 ? "Aún no hay experiencias" : "No hay experiencias en este filtro"}
          description={
            experiences.length === 0
              ? "Crea la primera experiencia para empezar a recibir reservaciones."
              : "Prueba con otro filtro."
          }
          action={
            experiences.length === 0 ? (
              <Link href="/admin/experiencias/nueva" className="text-small font-semibold underline">
                Crear la primera
              </Link>
            ) : (
              <Link href="/admin/experiencias" className="text-small font-semibold underline">
                Ver activas
              </Link>
            )
          }
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {visible.map(({ experience, state }) => (
            <ExperienceRow key={experience.id} experience={experience} state={state} supportsFlags={supportsFlags} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * A card per experience rather than a table row. There are eleven pieces of
 * information plus six actions per experience — a table wide enough for all
 * of that is unreadable at any width, and unusable on a phone.
 */
function ExperienceRow({
  experience,
  state,
  supportsFlags,
}: {
  experience: ExperienceWithStats;
  state: AdminExperienceState;
  supportsFlags: boolean;
}) {
  const available = Math.max(experience.capacity - experience.reservedPeople, 0);
  const maxParty = maxPartySizeOf(experience);
  const occupancy = experience.capacity > 0 ? Math.round((experience.reservedPeople / experience.capacity) * 100) : 0;

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={ADMIN_STATE_TONE[state]}>{ADMIN_STATE_LABEL[state]}</Badge>
            {isOriginal(experience) && <OriginalSeal />}
            {experience.featured && <Badge tone="sunny">Destacada</Badge>}
            {maxParty > 1 && <Badge tone="neutral">Hasta {maxParty} lugares</Badge>}
          </div>
          <h2 className="mt-2 text-heading">
            <Link href={`/admin/experiencias/${experience.id}`} className="hover:underline">
              {displayTitle(experience.title)}
            </Link>
          </h2>
          <p className="mt-0.5 text-small text-neutral-600">
            {experience.business?.name ?? "Sin negocio"} · {categoryLabel(experience.category)} ·{" "}
            {formatDateShort(experience.starts_at)} · {formatTime(experience.starts_at)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-small text-neutral-500">Ocupación</p>
          <p className="text-lg font-semibold">
            {experience.reservedPeople}
            <span className="text-neutral-400">/{experience.capacity}</span>
          </p>
          <p className={available === 0 ? "text-small font-medium text-orange" : "text-small text-neutral-500"}>
            {available === 0 ? "Sin lugares" : `${available} libres`}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={available === 0 ? "h-full rounded-full bg-orange" : "h-full rounded-full bg-neutral-900"}
          style={{ width: `${Math.min(occupancy, 100)}%` }}
        />
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-small text-neutral-600">
        <div className="flex gap-1.5">
          <dt className="text-neutral-500">Reservaciones:</dt>
          <dd>{experience.reservationCount}</dd>
        </div>
        {maxParty > 1 && (
          <div className="flex gap-1.5">
            <dt className="text-neutral-500">Grupos:</dt>
            <dd>{experience.groupCount}</dd>
          </div>
        )}
        <div className="flex gap-1.5">
          <dt className="text-neutral-500">Asistieron:</dt>
          <dd>{experience.attendedCount}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-neutral-500">No-show:</dt>
          <dd>{experience.noShowCount}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-neutral-500">Canceladas:</dt>
          <dd>{experience.cancelledCount}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
        <ExperienceRowActions
          experienceId={experience.id}
          status={experience.status}
          featured={experience.featured}
          isOriginal={isOriginal(experience)}
          archived={isArchived(experience)}
          supportsFlags={supportsFlags}
        />
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/reservaciones?experiencia=${experience.id}`}
            className="text-small font-medium text-neutral-700 underline hover:text-neutral-900"
          >
            Ver reservaciones
          </Link>
          <Link href={`/admin/experiencias/${experience.id}`} className="text-small font-medium underline">
            Editar
          </Link>
        </div>
      </div>
    </li>
  );
}
