import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminLeads } from "@/lib/admin-queries";
import {
  convertLeadToBusinessAction,
  setPartnerLeadNotesAction,
  setPartnerLeadStatusAction,
} from "@/lib/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/dates";
import { categoryLabel } from "@/lib/constants";
import {
  PARTNER_LEAD_STATUS_LABEL as STATUS_LABEL,
  PARTNER_LEAD_STATUS_TONE as STATUS_TONE,
  partnerLeadStatusOptions,
} from "@/lib/partner-leads";
import type { PartnerLead } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Solicitudes — Sunny Admin" };

/**
 * Business requests (brief §35). A short pipeline plus private notes and a
 * one-click conversion into a real business — deliberately not a CRM.
 *
 * Nothing here is ever deleted: a rejected or converted lead keeps its row
 * so the history of where a partner came from survives.
 */
export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const supabase = await createClient();
  const leads = await getAdminLeads(supabase);

  const statuses = partnerLeadStatusOptions(leads[0]);
  const supportsNotes = leads.length > 0 && "internal_notes" in leads[0];

  const visible = estado ? leads.filter((l) => l.status === estado) : leads;
  const countByStatus = new Map(statuses.map((s) => [s, leads.filter((l) => l.status === s).length]));

  return (
    <div>
      <h1 className="text-xl font-semibold sm:text-2xl">Solicitudes de negocios</h1>
      <p className="mt-1 text-small text-neutral-600">
        Cada solicitud llega del formulario público de <strong>Para negocios</strong>.
      </p>

      <nav aria-label="Filtrar solicitudes" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        <FilterChip href="/admin/solicitudes" active={!estado} label="Todas" count={leads.length} />
        {statuses.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/solicitudes?estado=${s}`}
            active={estado === s}
            label={STATUS_LABEL[s]}
            count={countByStatus.get(s) ?? 0}
          />
        ))}
      </nav>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6 border-neutral-300 bg-white"
          icon={Inbox}
          title={leads.length === 0 ? "Aún no hay solicitudes" : "No hay solicitudes en este estado"}
          description={
            leads.length === 0
              ? "Cuando un negocio envíe el formulario de Para negocios, aparecerá aquí con todos sus datos."
              : "Prueba con otro estado."
          }
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {visible.map((lead) => (
            <LeadCard key={lead.id} lead={lead} statuses={statuses} supportsNotes={supportsNotes} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={clsx(
        "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-small font-medium transition-colors",
        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:bg-white",
      )}
    >
      {label}
      <span className={active ? "text-white/70" : "text-neutral-400"}>{count}</span>
    </Link>
  );
}

function LeadCard({
  lead,
  statuses,
  supportsNotes,
}: {
  lead: PartnerLead;
  statuses: PartnerLead["status"][];
  supportsNotes: boolean;
}) {
  const convert = convertLeadToBusinessAction.bind(null, lead.id);
  const saveNotes = setPartnerLeadNotesAction.bind(null, lead.id);

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone={STATUS_TONE[lead.status]}>{STATUS_LABEL[lead.status]}</Badge>
          <h2 className="mt-2 text-heading">{lead.business_name}</h2>
          <p className="text-small text-neutral-600">{lead.contact_name}</p>
        </div>
        <p className="shrink-0 text-small text-neutral-500">Recibida {formatDate(lead.created_at)}</p>
      </div>

      {/* Everything the public form collected, so Emmy never has to go
          hunting in the database for a field the form asked for. */}
      <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-small sm:grid-cols-3">
        <Field label="Correo" value={lead.email} href={`mailto:${lead.email}`} />
        <Field label="WhatsApp / teléfono" value={lead.phone} href={lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, "")}` : undefined} />
        <Field label="Instagram" value={lead.instagram_url} href={lead.instagram_url ?? undefined} />
        <Field label="Categoría" value={lead.category ? categoryLabel(lead.category) : null} />
        <Field label="Ciudad" value={lead.city} />
        <Field label="Cupos que ofrece" value={lead.offered_spots ? String(lead.offered_spots) : null} />
      </dl>

      {lead.message && (
        <blockquote className="mt-4 rounded-md border-l-2 border-neutral-300 bg-neutral-50 px-4 py-3 text-small text-neutral-700">
          {lead.message}
        </blockquote>
      )}

      {supportsNotes && (
        <form action={saveNotes} className="mt-4">
          <label htmlFor={`notes-${lead.id}`} className="text-label text-neutral-500">
            Notas internas (solo tú las ves)
          </label>
          <textarea
            id={`notes-${lead.id}`}
            name="internal_notes"
            rows={2}
            defaultValue={lead.internal_notes ?? ""}
            placeholder="Con quién hablaste, qué quedó pendiente…"
            className="input mt-1 w-full"
          />
          <button type="submit" className="mt-2 min-h-9 rounded-md border border-neutral-300 px-3 text-small font-medium">
            Guardar notas
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <span className="text-label text-neutral-500">Cambiar a:</span>
        {statuses
          .filter((s) => s !== lead.status && s !== "converted")
          .map((s) => {
            const action = setPartnerLeadStatusAction.bind(null, lead.id, s);
            return (
              <form key={s} action={action}>
                <button
                  type="submit"
                  className="min-h-8 rounded-md border border-neutral-300 px-2.5 text-[0.75rem] font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {STATUS_LABEL[s]}
                </button>
              </form>
            );
          })}

        {lead.status !== "converted" ? (
          <form action={convert} className="ml-auto">
            <button
              type="submit"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-neutral-900 px-3 text-[0.75rem] font-medium text-white hover:bg-neutral-800"
            >
              Convertir en negocio
              <ArrowRight aria-hidden size={13} strokeWidth={1.75} />
            </button>
          </form>
        ) : lead.converted_business_id ? (
          <Link
            href={`/admin/negocios/${lead.converted_business_id}`}
            className="ml-auto text-small font-medium underline"
          >
            Ver negocio
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function Field({ label, value, href }: { label: string; value: string | null; href?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="truncate">
        {value ? (
          href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </dd>
    </div>
  );
}
