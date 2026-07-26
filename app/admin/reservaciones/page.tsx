import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/dates";
import { ReservationRowActions } from "@/components/admin/ReservationRowActions";
import type { Business, Experience, Reservation } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reservaciones — Sunny Admin" };

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  attended: "Asistió",
  no_show: "No-show",
};

const STATUS_TONE: Record<string, "neutral" | "sunny" | "success" | "danger"> = {
  confirmed: "sunny",
  cancelled: "danger",
  attended: "success",
  no_show: "neutral",
};

export default async function AdminReservacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; date?: string }>;
}) {
  const { q, status, date } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("reservations")
    .select("*, experience:experiences(*, business:businesses(*))")
    .order("reserved_at", { ascending: false });

  let rows = (data ?? []) as unknown as (Reservation & { experience: Experience & { business: Business } })[];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? ""]));

  const emailMap = new Map<string, string>();
  try {
    const adminClient = createAdminClient();
    let page = 1;
    for (;;) {
      const { data: userPage } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
      (userPage?.users ?? []).forEach((u) => emailMap.set(u.id, u.email ?? ""));
      if (!userPage || userPage.users.length < 1000) break;
      page += 1;
    }
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY not configured — email column will show as empty.
  }

  if (status) rows = rows.filter((r) => r.status === status);
  if (date) rows = rows.filter((r) => r.experience && formatDate(r.experience.starts_at) === formatDate(date));
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) => {
      const name = (profileMap.get(r.user_id) ?? "").toLowerCase();
      const email = (emailMap.get(r.user_id) ?? "").toLowerCase();
      const title = (r.experience?.title ?? "").toLowerCase();
      return name.includes(needle) || email.includes(needle) || r.folio.toLowerCase().includes(needle) || title.includes(needle);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Reservaciones</h1>
        <a href={`/api/admin/reservations/export`} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          Exportar CSV
        </a>
      </div>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre, correo, folio o experiencia"
          className="input min-w-[280px] flex-1"
        />
        <select name="status" defaultValue={status ?? ""} className="input">
          <option value="">Todos los estados</option>
          <option value="confirmed">Confirmada</option>
          <option value="cancelled">Cancelada</option>
          <option value="attended">Asistió</option>
          <option value="no_show">No-show</option>
        </select>
        <input type="date" name="date" defaultValue={date ?? ""} className="input" />
        <button type="submit" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium">
          Filtrar
        </button>
        {(q || status || date) && (
          <a href="/admin/reservaciones" className="rounded-md px-4 py-2 text-sm text-neutral-500 underline">
            Limpiar
          </a>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Folio</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Experiencia</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Fuente</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 align-top hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{r.folio}</td>
                <td className="px-4 py-3">{profileMap.get(r.user_id) || "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{emailMap.get(r.user_id) || "—"}</td>
                <td className="px-4 py-3">
                  {r.experience?.title}
                  <div className="text-xs text-neutral-500">{r.experience?.business?.name}</div>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {r.experience && `${formatDate(r.experience.starts_at)} · ${formatTime(r.experience.starts_at)}`}
                </td>
                <td className="px-4 py-3 text-neutral-600">{r.source || "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <ReservationRowActions reservationId={r.id} status={r.status} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  Sin resultados para estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-neutral-500">Mostrando {rows.length} reservaciones.</p>
    </div>
  );
}
