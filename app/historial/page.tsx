import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserReservationHistory } from "@/lib/queries";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/dates";
import { categoryLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Historial — Sunny Project" };

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  attended: "Asististe",
  no_show: "No asististe",
};

const STATUS_TONE: Record<string, "neutral" | "sunny" | "orange" | "success" | "danger"> = {
  confirmed: "sunny",
  cancelled: "danger",
  attended: "success",
  no_show: "neutral",
};

export default async function HistorialPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/acceso?next=/historial");

  const supabase = await createClient();
  const reservations = await getUserReservationHistory(supabase, user.id);

  return (
    <main className="py-14 sm:py-20">
      <Container>
        <h1 className="text-title">Mi historial</h1>
        <p className="mt-2 text-gray">Todas tus experiencias confirmadas, canceladas y asistidas.</p>

        {reservations.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-carbon/20 p-12 text-center">
            <p className="text-subtitle">Aún no tienes historial</p>
            <p className="mt-2 text-gray">Reclama tu primer pase para empezar a construir tu historial.</p>
            <LinkButton href="/experiencias" className="mt-6">
              Explorar experiencias
            </LinkButton>
          </div>
        ) : (
          <ul className="mt-10 flex flex-col divide-y divide-carbon/10 rounded-xl border border-carbon/10 bg-warm-white">
            {reservations.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray">{categoryLabel(r.experience.category)}</p>
                  <p className="font-medium">{r.experience.title}</p>
                  <p className="text-sm text-gray">{r.experience.business.name}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  <p className="text-sm text-gray">
                    {formatDate(r.experience.starts_at)} · {formatTime(r.experience.starts_at)}
                  </p>
                  <p className="font-mono text-xs text-gray">{r.folio}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
