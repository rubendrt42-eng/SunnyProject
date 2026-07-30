import type { Metadata } from "next";
import Link from "next/link";
import { Download, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_PAGE_SIZE, getAdminReservations, type ReservationWithContext } from "@/lib/admin-queries";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatDateShort, formatTime } from "@/lib/dates";
import { displayTitle } from "@/lib/demo-content";
import { partySizeOf } from "@/lib/experience-flags";
import { ReservationRowActions } from "@/components/admin/ReservationRowActions";
import type { Experience, ReservationStatus } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reservaciones — Sunny Admin" };

const STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  attended: "Asistió",
  no_show: "No-show",
};

const STATUS_TONE: Record<ReservationStatus, "neutral" | "sunny" | "success" | "danger"> = {
  confirmed: "sunny",
  cancelled: "danger",
  attended: "success",
  no_show: "neutral",
};

const STATUSES: ReservationStatus[] = ["confirmed", "attended", "no_show", "cancelled"];

function isStatus(value: string | undefined): value is ReservationStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

interface Params {
  q?: string;
  status?: string;
  experiencia?: string;
  grupo?: string;
  fecha?: string;
  page?: string;
}

export default async function AdminReservacionesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { q, status, experiencia, grupo, fecha, page: pageParam } = await searchParams;
  const page = Math.max(Number.parseInt(pageParam ?? "1", 10) || 1, 1);

  const supabase = await createClient();

  /**
   * Status and experience are filtered in the query (indexed columns), so
   * only the rows Emmy asked for come back. The previous version loaded
   * every reservation ever made, plus every auth user in pages of 1000, on
   * every request — fine with twelve rows, a problem later (brief §42).
   */
  const [{ reservations, total, error }, { data: experienceRows }] = await Promise.all([
    getAdminReservations(supabase, {
      page,
      status: isStatus(status) ? status : undefined,
      experienceId: experiencia,
    }),
    supabase.from("experiences").select("id, title, starts_at").order("starts_at", { ascending: false }).limit(100),
  ]);

  const emailByUserId = await lookupEmails(reservations.map((r) => r.user_id));

  // Text search, party-size and exact-date narrowing happen in memory over
  // the current page only — they are the filters Postgres cannot do here
  // (the name lives in profiles, the email in auth.users, and party size may
  // not exist as a column yet).
  const needle = q?.trim().toLowerCase();
  const visible = reservations.filter((r) => {
    if (grupo === "grupo" && partySizeOf(r) < 2) return false;
    if (grupo === "individual" && partySizeOf(r) > 1) return false;
    if (fecha && r.experience && formatDate(r.experience.starts_at) !== formatDate(fecha)) return false;
    if (needle) {
      const haystack = [
        r.profile?.full_name ?? "",
        emailByUserId.get(r.user_id) ?? "",
        r.folio,
        r.experience?.title ?? "",
        ...r.companions.map((c) => c.full_name),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const experiences = (experienceRows ?? []) as Pick<Experience, "id" | "title" | "starts_at">[];
  const totalPages = Math.max(Math.ceil(total / ADMIN_PAGE_SIZE), 1);
  const hasFilters = Boolean(q || status || experiencia || grupo || fecha);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold sm:text-2xl">Reservaciones</h1>
        <a
          href="/api/admin/reservations/export"
          className="flex min-h-10 items-center gap-2 rounded-md bg-neutral-900 px-4 text-small font-medium text-white hover:bg-neutral-800"
        >
          <Download aria-hidden size={16} strokeWidth={1.5} />
          Exportar CSV
        </a>
      </div>

      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[240px] flex-1 flex-col gap-1">
          <span className="text-label text-neutral-500">Buscar</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Nombre, correo, folio, experiencia o acompañante"
            className="input h-10"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-neutral-500">Experiencia</span>
          <select name="experiencia" defaultValue={experiencia ?? ""} className="input h-10">
            <option value="">Todas</option>
            {experiences.map((e) => (
              <option key={e.id} value={e.id}>
                {displayTitle(e.title)} — {formatDateShort(e.starts_at)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-neutral-500">Estado</span>
          <select name="status" defaultValue={status ?? ""} className="input h-10">
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-neutral-500">Tipo</span>
          <select name="grupo" defaultValue={grupo ?? ""} className="input h-10">
            <option value="">Individual y grupo</option>
            <option value="individual">Solo individuales</option>
            <option value="grupo">Solo grupos</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-neutral-500">Fecha</span>
          <input type="date" name="fecha" defaultValue={fecha ?? ""} className="input h-10" />
        </label>

        <button type="submit" className="min-h-10 rounded-md border border-neutral-300 bg-white px-4 text-small font-medium">
          Filtrar
        </button>
        {hasFilters && (
          <Link href="/admin/reservaciones" className="min-h-10 px-2 text-small text-neutral-500 underline">
            Limpiar
          </Link>
        )}
      </form>

      {error ? (
        <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-small text-red-800">
          No pudimos cargar las reservaciones.
        </p>
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6 border-neutral-300 bg-white"
          icon={Ticket}
          title={total === 0 ? "Aún no hay reservaciones" : "Sin resultados para estos filtros"}
          description={
            total === 0
              ? "Cuando alguien reserve una experiencia aparecerá aquí."
              : "Ajusta o limpia los filtros para ver más."
          }
          action={
            hasFilters ? (
              <Link href="/admin/reservaciones" className="text-small font-semibold underline">
                Limpiar filtros
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-3">
            {visible.map((r) => (
              <ReservationCard key={r.id} reservation={r} email={emailByUserId.get(r.user_id) ?? null} />
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-small text-neutral-600">
            <p>
              Mostrando {visible.length} de {total} {total === 1 ? "reservación" : "reservaciones"}
              {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                {page > 1 && (
                  <PageLink page={page - 1} params={{ q, status, experiencia, grupo, fecha }} label="Anterior" />
                )}
                {page < totalPages && (
                  <PageLink page={page + 1} params={{ q, status, experiencia, grupo, fecha }} label="Siguiente" />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PageLink({ page, params, label }: { page: number; params: Omit<Params, "page">; label: string }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  search.set("page", String(page));
  return (
    <Link
      href={`/admin/reservaciones?${search.toString()}`}
      className="min-h-9 rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-medium"
    >
      {label}
    </Link>
  );
}

function ReservationCard({ reservation, email }: { reservation: ReservationWithContext; email: string | null }) {
  const people = partySizeOf(reservation);
  const experience = reservation.experience;

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[reservation.status]}>{STATUS_LABEL[reservation.status]}</Badge>
            <span className="font-mono text-[0.7rem] text-neutral-500">{reservation.folio}</span>
            {people > 1 && <Badge tone="neutral">Grupo de {people}</Badge>}
          </div>

          <p className="mt-2 text-heading">{reservation.profile?.full_name || "Sin nombre en el perfil"}</p>
          <p className="text-small text-neutral-600">{email ?? "Correo no disponible"}</p>

          <p className="mt-2 text-small text-neutral-700">
            {experience ? (
              <>
                <Link href={`/admin/experiencias/${experience.id}`} className="font-medium underline">
                  {displayTitle(experience.title)}
                </Link>
                {" — "}
                {formatDateShort(experience.starts_at)} · {formatTime(experience.starts_at)}
                {experience.business?.name ? ` · ${experience.business.name}` : ""}
              </>
            ) : (
              "Experiencia eliminada"
            )}
          </p>

          {reservation.companions.length > 0 && (
            <div className="mt-3 rounded-md bg-neutral-50 p-3">
              <p className="text-label text-neutral-500">Acompañantes</p>
              <ul className="mt-1.5 flex flex-col gap-1 text-small text-neutral-700">
                {reservation.companions.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-2">
                    <span>{c.full_name}</span>
                    {c.email && <span className="text-neutral-500">{c.email}</span>}
                    <Badge tone={STATUS_TONE[(c.status as ReservationStatus) ?? "confirmed"] ?? "neutral"}>
                      {STATUS_LABEL[(c.status as ReservationStatus) ?? "confirmed"] ?? c.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="shrink-0 text-right text-small text-neutral-500">
          <p>Reservó {formatDateShort(reservation.reserved_at)}</p>
          {reservation.source && <p className="mt-0.5">Origen: {reservation.source}</p>}
        </div>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-3">
        <ReservationRowActions reservationId={reservation.id} status={reservation.status} />
      </div>
    </li>
  );
}

/**
 * Emails for the current page only.
 *
 * They live in `auth.users`, which needs the service-role client, and there
 * is no "get by id list" API — so this does one lookup per user on the page
 * (bounded by the page size), in small concurrent batches. The previous
 * implementation walked the entire user table in pages of 1000 on every
 * request just to fill one column.
 *
 * If the service-role key is absent, the column reads "no disponible"
 * rather than failing the page.
 */
async function lookupEmails(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)];
  const emails = new Map<string, string>();
  if (unique.length === 0) return emails;

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return emails;
  }

  const BATCH = 10;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (id) => {
        try {
          const { data } = await adminClient.auth.admin.getUserById(id);
          return [id, data.user?.email ?? ""] as const;
        } catch {
          return [id, ""] as const;
        }
      }),
    );
    for (const [id, email] of results) {
      if (email) emails.set(id, email);
    }
  }

  return emails;
}
