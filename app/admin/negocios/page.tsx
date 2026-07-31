import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ExternalLink, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminExperiences } from "@/lib/admin-queries";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BusinessRowActions } from "@/components/admin/BusinessRowActions";
import { categoryLabel } from "@/lib/constants";
import { isPast } from "@/lib/dates";
import type { Business } from "@/lib/database.types";
import { paginate, searchRows } from "@/lib/admin-list";
import { AdminSearch, AdminPager } from "@/components/admin/AdminListControls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Negocios — Sunny Admin" };

interface BusinessStats {
  activeExperiences: number;
  pastExperiences: number;
  spotsOffered: number;
  reservedPeople: number;
  attended: number;
}

export default async function AdminNegociosPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page } = await searchParams;
  const supabase = await createClient();

  const [{ data }, { experiences }] = await Promise.all([
    supabase.from("businesses").select("*").order("name"),
    getAdminExperiences(supabase),
  ]);

  const allBusinesses = (data ?? []) as Business[];
  const searched = searchRows(allBusinesses, q, (b) => [b.name, b.category, b.contact_email, b.contact_name]);
  const paged = paginate(searched, page);
  const businesses = paged.rows;
  const supportsPartnerFlag = allBusinesses.length > 0 && "featured_as_partner" in allBusinesses[0];

  // One pass over the experiences we already have, rather than a query per
  // business.
  const statsByBusiness = new Map<string, BusinessStats>();
  for (const e of experiences) {
    const key = e.business_id;
    const s = statsByBusiness.get(key) ?? { activeExperiences: 0, pastExperiences: 0, spotsOffered: 0, reservedPeople: 0, attended: 0 };
    if (isPast(e.starts_at) || e.status === "completed") s.pastExperiences += 1;
    else if (e.status !== "cancelled" && !e.archived_at) s.activeExperiences += 1;
    s.spotsOffered += e.capacity;
    s.reservedPeople += e.reservedPeople;
    s.attended += e.attendedCount;
    statsByBusiness.set(key, s);
  }

  const featuredCount = businesses.filter((b) => b.featured_as_partner === true).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-subtitle">Negocios</h1>
        <Link
          href="/admin/negocios/nuevo"
          className="flex min-h-10 items-center gap-2 rounded-md bg-neutral-900 px-4 text-small font-medium text-white hover:bg-neutral-800"
        >
          <Building2 aria-hidden size={16} strokeWidth={1.5} />
          Nuevo negocio
        </Link>
      </div>

      <p className="mt-2 text-small text-neutral-600">
        {supportsPartnerFlag ? (
          featuredCount > 0 ? (
            <>
              {featuredCount} {featuredCount === 1 ? "negocio aparece" : "negocios aparecen"} como aliado en la página
              pública.
            </>
          ) : (
            <>
              Ningún negocio se muestra todavía como aliado público, así que la sección{" "}
              <em>Espacios que forman parte de Sunny</em> no aparece en la Home. Actívala con{" "}
              <strong>Mostrar como aliado</strong>.
            </>
          )
        ) : (
          <>
            La opción <strong>Mostrar como aliado</strong> aparecerá cuando se aplique la migración pendiente.
          </>
        )}
      </p>

      {businesses.length === 0 ? (
        <EmptyState
          className="mt-6 border-neutral-300 bg-white"
          icon={Store}
          title="Aún no hay negocios"
          description="Crea un negocio para poder publicar experiencias, o convierte una solicitud desde Solicitudes."
          action={
            <Link href="/admin/negocios/nuevo" className="text-small font-semibold underline">
              Crear el primero
            </Link>
          }
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {businesses.map((b) => {
            const s = statsByBusiness.get(b.id);
            return (
              <li key={b.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={b.active ? "success" : "neutral"}>{b.active ? "Activo" : "Inactivo"}</Badge>
                      {b.featured_as_partner === true && <Badge tone="sunny">Aliado público</Badge>}
                      <span className="text-small text-neutral-500">{categoryLabel(b.category)}</span>
                    </div>

                    <h2 className="mt-2 text-heading">
                      <Link href={`/admin/negocios/${b.id}`} className="hover:underline">
                        {b.name}
                      </Link>
                    </h2>

                    {/* Internal contact details. Shown here for Emmy only —
                        never rendered on any public page. */}
                    <p className="mt-1 text-small text-neutral-600">
                      {[b.contact_name, b.contact_email, b.contact_phone].filter(Boolean).join(" · ") ||
                        "Sin datos de contacto"}
                    </p>

      <AdminSearch placeholder="Buscar por nombre, categoría o contacto…" value={q} />
                    {b.instagram_url && (
                      <a
                        href={b.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-small text-neutral-600 underline"
                      >
                        <ExternalLink aria-hidden size={13} strokeWidth={1.5} />
                        Instagram
                      </a>
                    )}
                  </div>

                  <dl className="grid shrink-0 grid-cols-2 gap-x-5 gap-y-1 text-small sm:grid-cols-3">
                    <div>
                      <dt className="text-neutral-500">Activas</dt>
                      <dd className="font-medium">{s?.activeExperiences ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Pasadas</dt>
                      <dd className="font-medium">{s?.pastExperiences ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Cupos</dt>
                      <dd className="font-medium">{s?.spotsOffered ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Reservados</dt>
                      <dd className="font-medium">{s?.reservedPeople ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Asistieron</dt>
                      <dd className="font-medium">{s?.attended ?? 0}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                  <BusinessRowActions
                    businessId={b.id}
                    active={b.active}
                    featuredAsPartner={b.featured_as_partner === true}
                    supportsPartnerFlag={supportsPartnerFlag}
                  />
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/experiencias?estado=todas`}
                      className="text-small font-medium text-neutral-700 underline hover:text-neutral-900"
                    >
                      Ver experiencias
                    </Link>
                    <Link href={`/admin/negocios/${b.id}`} className="text-small font-medium underline">
                      Editar
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <AdminPager paged={paged} carry={{ q }} label="negocios" />
    </div>
  );
}
