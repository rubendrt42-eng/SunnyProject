import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { setPartnerLeadStatusAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/dates";
import { categoryLabel } from "@/lib/constants";
import type { PartnerLead, PartnerLeadStatus } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Solicitudes — Sunny Admin" };

const STATUS_LABEL: Record<PartnerLeadStatus, string> = {
  new: "Nueva",
  contacted: "Contactado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const STATUS_TONE: Record<PartnerLeadStatus, "neutral" | "sunny" | "success" | "danger"> = {
  new: "sunny",
  contacted: "neutral",
  accepted: "success",
  rejected: "danger",
};

const STATUSES: PartnerLeadStatus[] = ["new", "contacted", "accepted", "rejected"];

export default async function AdminSolicitudesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("partner_leads").select("*").order("created_at", { ascending: false });
  const leads = (data ?? []) as PartnerLead[];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Solicitudes de negocios</h1>

      <div className="mt-6 flex flex-col gap-4">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{lead.business_name}</p>
                <p className="text-sm text-neutral-600">
                  {lead.contact_name} · {lead.email} {lead.phone && `· ${lead.phone}`}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {lead.category ? categoryLabel(lead.category) : "Sin categoría"} · {lead.city} ·{" "}
                  {lead.offered_spots ? `${lead.offered_spots} lugares` : "Cupo sin definir"}
                </p>
              </div>
              <Badge tone={STATUS_TONE[lead.status]}>{STATUS_LABEL[lead.status]}</Badge>
            </div>

            {lead.message && <p className="mt-3 text-sm text-neutral-700">&quot;{lead.message}&quot;</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {STATUSES.filter((s) => s !== lead.status).map((s) => {
                const action = setPartnerLeadStatusAction.bind(null, lead.id, s);
                return (
                  <form key={s} action={action}>
                    <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                      Marcar como {STATUS_LABEL[s].toLowerCase()}
                    </button>
                  </form>
                );
              })}
              <span className="ml-auto text-xs text-neutral-400">{formatDate(lead.created_at)}</span>
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            Aún no hay solicitudes de negocios.
          </div>
        )}
      </div>
    </div>
  );
}
