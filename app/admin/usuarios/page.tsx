import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminUsers } from "@/lib/admin-queries";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Usuarios — Sunny Admin" };

/**
 * Users view (brief §36). Read-only on purpose.
 *
 * What it deliberately does NOT do, because the brief rules it out and
 * because each is a real risk:
 * - No role editing from the UI. `profiles.role` is additionally protected
 *   in the database by the `trg_prevent_role_self_update` trigger, so even
 *   a crafted request cannot escalate.
 * - No password actions.
 * - No bulk email or campaigns.
 * - No email addresses in the list. They live in auth.users, and a list of
 *   every member's email is more exposure than this screen needs — the
 *   reservations view surfaces the email for the person Emmy is actually
 *   dealing with, and the CSV export carries them for real operational use.
 */
export default async function AdminUsuariosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { users, error } = await getAdminUsers(supabase, { search: q });

  return (
    <div>
      <h1 className="text-xl font-semibold sm:text-2xl">Usuarios</h1>
      <p className="mt-1 text-small text-neutral-600">
        Personas registradas y su historial. Esta vista es de consulta: no se editan permisos ni contraseñas desde aquí.
      </p>

      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[240px] flex-1 flex-col gap-1">
          <span className="text-label text-neutral-500">Buscar por nombre</span>
          <input type="search" name="q" defaultValue={q ?? ""} placeholder="Nombre completo" className="input h-10" />
        </label>
        <button type="submit" className="min-h-10 rounded-md border border-neutral-300 bg-white px-4 text-small font-medium">
          Buscar
        </button>
        {q && (
          <Link href="/admin/usuarios" className="min-h-10 px-2 text-small text-neutral-500 underline">
            Limpiar
          </Link>
        )}
      </form>

      {error ? (
        <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-small text-red-800">
          No pudimos cargar los usuarios.
        </p>
      ) : users.length === 0 ? (
        <EmptyState
          className="mt-6 border-neutral-300 bg-white"
          icon={Users}
          title={q ? "Nadie coincide con esa búsqueda" : "Aún no hay usuarios registrados"}
          description={
            q ? "Prueba con otro nombre." : "Los perfiles aparecen aquí cuando alguien inicia sesión por primera vez."
          }
          action={
            q ? (
              <Link href="/admin/usuarios" className="text-small font-semibold underline">
                Ver todos
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-lg border border-neutral-200 bg-white sm:block">
            <table className="w-full min-w-[820px] text-left text-small">
              <thead className="border-b border-neutral-200 text-neutral-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                  <th scope="col" className="px-4 py-3 font-medium">Ciudad</th>
                  <th scope="col" className="px-4 py-3 font-medium">Registro</th>
                  <th scope="col" className="px-4 py-3 font-medium">Reservas</th>
                  <th scope="col" className="px-4 py-3 font-medium">Asistió</th>
                  <th scope="col" className="px-4 py-3 font-medium">No-show</th>
                  <th scope="col" className="px-4 py-3 font-medium">Última actividad</th>
                  <th scope="col" className="px-4 py-3 font-medium">Perfil</th>
                </tr>
              </thead>
              <tbody>
                {users.map(({ profile, reservationCount, attendedCount, noShowCount, lastActivityAt }) => (
                  <tr key={profile.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <span className="font-medium">{profile.full_name || "Sin nombre"}</span>
                      {profile.role === "admin" && (
                        <Badge tone="sunny" className="ml-2">
                          Admin
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{profile.city || "—"}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(profile.created_at)}</td>
                    <td className="px-4 py-3 text-neutral-600">{reservationCount}</td>
                    <td className="px-4 py-3 text-neutral-600">{attendedCount}</td>
                    <td className={noShowCount > 0 ? "px-4 py-3 font-medium text-orange-ink" : "px-4 py-3 text-neutral-600"}>
                      {noShowCount}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {lastActivityAt ? formatDate(lastActivityAt) : "Sin reservaciones"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={isComplete(profile) ? "success" : "neutral"}>
                        {isComplete(profile) ? "Completo" : "Incompleto"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 flex flex-col gap-3 sm:hidden">
            {users.map(({ profile, reservationCount, attendedCount, noShowCount, lastActivityAt }) => (
              <li key={profile.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-small font-semibold">{profile.full_name || "Sin nombre"}</p>
                  <Badge tone={isComplete(profile) ? "success" : "neutral"}>
                    {isComplete(profile) ? "Completo" : "Incompleto"}
                  </Badge>
                </div>
                <p className="mt-1 text-small text-neutral-600">
                  {profile.city || "Sin ciudad"} · desde {formatDate(profile.created_at)}
                </p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-small">
                  <div>
                    <dt className="text-neutral-500">Reservas</dt>
                    <dd className="font-medium">{reservationCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Asistió</dt>
                    <dd className="font-medium">{attendedCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">No-show</dt>
                    <dd className={noShowCount > 0 ? "font-medium text-orange-ink" : "font-medium"}>{noShowCount}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-small text-neutral-500">
                  Última actividad: {lastActivityAt ? formatDate(lastActivityAt) : "sin reservaciones"}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-small text-neutral-500">
            {users.length} {users.length === 1 ? "usuario" : "usuarios"}. Para ver el detalle de las reservaciones de
            alguien, búscalo por nombre en{" "}
            <Link href="/admin/reservaciones" className="underline">
              Reservaciones
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}

/** "Complete" means the profile can actually reserve — the same rule claim_reservation() enforces. */
function isComplete(profile: { full_name: string | null; adult_confirmed_at: string | null }): boolean {
  return Boolean(profile.full_name?.trim()) && Boolean(profile.adult_confirmed_at);
}
