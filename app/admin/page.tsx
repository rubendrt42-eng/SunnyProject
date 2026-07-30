import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, type ExperienceWithStats } from "@/lib/admin-queries";
import { computeAdminState, ADMIN_STATE_LABEL, ADMIN_STATE_TONE, maxPartySizeOf } from "@/lib/experience-flags";
import { formatDateShort, formatTime } from "@/lib/dates";
import { displayTitle } from "@/lib/demo-content";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard — Sunny Admin" };

/**
 * Emmy's dashboard. Deliberately NOT a wall of ten fixed metric tiles: the
 * brief is explicit that it should answer questions, and that the dynamic
 * register of experiences is the point.
 *
 * So the page leads with "what happens this week" as a real table of
 * experiences with capacity, spots taken, spots left and group count, then
 * a "needs attention" list, and only then a short strip of totals. Every
 * number comes from Supabase; occupancy counts *people* (party size), not
 * reservation rows, so it matches what the public site shows.
 */
export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const data = await getDashboardData(supabase);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-subtitle">Esta semana en Sunny</h1>
          <p className="mt-1 text-small text-neutral-600">
            {data.nextExperience ? (
              <>
                La siguiente experiencia es{" "}
                <Link href={`/admin/experiencias/${data.nextExperience.id}`} className="font-medium underline">
                  {displayTitle(data.nextExperience.title)}
                </Link>{" "}
                — {formatDateShort(data.nextExperience.starts_at)} a las {formatTime(data.nextExperience.starts_at)}.
              </>
            ) : (
              "No hay experiencias publicadas próximas."
            )}
          </p>
        </div>
        <Link
          href="/admin/experiencias/nueva"
          className="flex min-h-10 items-center rounded-md bg-neutral-900 px-4 text-small font-medium text-white hover:bg-neutral-800"
        >
          Nueva experiencia
        </Link>
      </div>

      {data.error && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-small text-red-800">
          No pudimos leer algunos datos. Los números de abajo pueden estar incompletos.
        </p>
      )}

      {/* Needs attention comes before the totals: it is the only part that
          asks Emmy to do something. */}
      {data.needsAttention.length > 0 && (
        <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 text-small font-semibold text-amber-900">
            <AlertTriangle aria-hidden size={16} strokeWidth={1.75} />
            Necesita atención
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-amber-200/70">
            {data.needsAttention.map(({ experience, reason }) => (
              <li key={`${experience.id}-${reason}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <Link href={`/admin/experiencias/${experience.id}`} className="text-small font-medium text-amber-950 underline">
                  {displayTitle(experience.title)}
                </Link>
                <span className="text-small text-amber-900">{reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-heading">Próximos 7 días</h2>
        {data.weekExperiences.length === 0 ? (
          <EmptyState
            className="mt-4 border-neutral-300 bg-white"
            icon={CalendarDays}
            title="No hay experiencias publicadas en los próximos 7 días"
            description="Crea una nueva experiencia o publica un borrador para que aparezca aquí."
            action={
              <Link href="/admin/experiencias" className="text-small font-semibold underline">
                Ver todas las experiencias
              </Link>
            }
          />
        ) : (
          <WeekTable experiences={data.weekExperiences} />
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-heading">Totales</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Próximas" value={data.upcomingCount} />
          <Stat label="Cupos totales" value={data.totalCapacity} hint="Solo experiencias publicadas" />
          <Stat label="Lugares reservados" value={data.reservedPeople} hint="Contando acompañantes" />
          <Stat label="Lugares disponibles" value={data.availableSpots} />
          <Stat label="Reservas de la semana" value={data.weekReservations} />
          <Stat label="Asistencias / no-show" value={`${data.attendedCount} / ${data.noShowCount}`} />
        </dl>
      </section>

      {data.newLeads > 0 && (
        <Link
          href="/admin/solicitudes"
          className="mt-8 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
        >
          <Inbox aria-hidden size={18} strokeWidth={1.5} className="text-orange-ink" />
          <span className="text-small font-medium">
            {data.newLeads} {data.newLeads === 1 ? "solicitud nueva" : "solicitudes nuevas"} de negocios
          </span>
          <span className="ml-auto text-small text-neutral-500">Revisar</span>
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <dt className="text-small text-neutral-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold">{value}</dd>
      {hint && <p className="mt-0.5 text-label text-neutral-400">{hint}</p>}
    </div>
  );
}

/** Table on sm: and up, stacked cards below — a 9-column table is unusable at 375px. */
function WeekTable({ experiences }: { experiences: ExperienceWithStats[] }) {
  return (
    <>
      <div className="mt-4 hidden overflow-x-auto rounded-lg border border-neutral-200 bg-white sm:block">
        <table className="w-full min-w-[760px] text-left text-small">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Experiencia</th>
              <th scope="col" className="px-4 py-3 font-medium">Negocio</th>
              <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
              <th scope="col" className="px-4 py-3 font-medium">Cupo</th>
              <th scope="col" className="px-4 py-3 font-medium">Reservados</th>
              <th scope="col" className="px-4 py-3 font-medium">Disponibles</th>
              <th scope="col" className="px-4 py-3 font-medium">Grupos</th>
              <th scope="col" className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((e) => {
              const state = computeAdminState(e, e.reservedPeople);
              const available = Math.max(e.capacity - e.reservedPeople, 0);
              return (
                <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/experiencias/${e.id}`} className="font-medium hover:underline">
                      {displayTitle(e.title)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{e.business?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatDateShort(e.starts_at)} · {formatTime(e.starts_at)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{e.capacity}</td>
                  <td className="px-4 py-3 text-neutral-600">{e.reservedPeople}</td>
                  <td className={available === 0 ? "px-4 py-3 font-semibold text-orange-ink" : "px-4 py-3 text-neutral-600"}>
                    {available}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {maxPartySizeOf(e) > 1 ? `${e.groupCount} de ${e.reservationCount}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ADMIN_STATE_TONE[state]}>{ADMIN_STATE_LABEL[state]}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 flex flex-col gap-3 sm:hidden">
        {experiences.map((e) => {
          const state = computeAdminState(e, e.reservedPeople);
          const available = Math.max(e.capacity - e.reservedPeople, 0);
          return (
            <li key={e.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/admin/experiencias/${e.id}`} className="text-small font-semibold hover:underline">
                  {displayTitle(e.title)}
                </Link>
                <Badge tone={ADMIN_STATE_TONE[state]}>{ADMIN_STATE_LABEL[state]}</Badge>
              </div>
              <p className="mt-1 text-small text-neutral-600">
                {e.business?.name ?? "—"} · {formatDateShort(e.starts_at)} · {formatTime(e.starts_at)}
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-small">
                <div>
                  <dt className="text-neutral-500">Cupo</dt>
                  <dd className="font-medium">{e.capacity}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Reservados</dt>
                  <dd className="font-medium">{e.reservedPeople}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Libres</dt>
                  <dd className={available === 0 ? "font-semibold text-orange-ink" : "font-medium"}>{available}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
