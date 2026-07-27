import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getActiveWeeklyReservation, getPublicExperiences } from "@/lib/queries";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { CancelReservationButton } from "@/components/pass/CancelReservationButton";
import { formatDateTime, hoursUntil, nextMondayLabel, isPast } from "@/lib/dates";
import { CANCELLATION_WINDOW_HOURS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi pase — Sunny Project" };

const RESERVATION_STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  attended: "Asististe",
  no_show: "No asististe",
  cancelled: "Cancelado",
};

export default async function MiPasePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/acceso?next=/mi-pase");

  const supabase = await createClient();
  const reservation = await getActiveWeeklyReservation(supabase, user.id);

  const isLivePass = reservation && reservation.status === "confirmed" && !isPast(reservation.experience.starts_at);
  const isUsedPass = reservation && !isLivePass;

  if (isLivePass && reservation) {
    const { experience } = reservation;
    const canCancel = hoursUntil(experience.starts_at) >= CANCELLATION_WINDOW_HOURS;

    return (
      <main className="py-14 sm:py-20">
        <Container className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-orange">Tu pase</p>
          <h1 className="mt-1 font-serif text-4xl italic">{experience.title}</h1>

          <div className="mt-8 rounded-2xl border border-carbon/10 bg-warm-white p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray">Folio</p>
                <p className="font-mono text-2xl font-semibold tracking-wide">{reservation.folio}</p>
              </div>
              <Badge tone="success">{RESERVATION_STATUS_LABEL[reservation.status]}</Badge>
            </div>

            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <dt className="font-medium text-gray">Nombre</dt>
              <dd>{user.profile?.full_name}</dd>
              <dt className="font-medium text-gray">Negocio</dt>
              <dd>{experience.business.name}</dd>
              <dt className="font-medium text-gray">Fecha</dt>
              <dd>{formatDateTime(experience.starts_at)}</dd>
              <dt className="font-medium text-gray">Lugar</dt>
              <dd>{experience.location_name}</dd>
              {experience.address && (
                <>
                  <dt className="font-medium text-gray">Dirección</dt>
                  <dd>{experience.address}</dd>
                </>
              )}
            </dl>

            {experience.instructions && (
              <div className="mt-6 rounded-xl bg-sunny/20 p-4 text-sm">
                <p className="font-medium">Instrucciones</p>
                <p className="mt-1 text-carbon">{experience.instructions}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {experience.maps_url && (
                <LinkButton href={experience.maps_url} variant="outline" size="sm">
                  Abrir en Google Maps
                </LinkButton>
              )}
              <LinkButton href={`/api/reservations/${reservation.id}/ics`} variant="outline" size="sm">
                Agregar al calendario
              </LinkButton>
            </div>

            <p className="mt-6 text-xs text-gray">
              Tu pase es personal, no transferible y no admite acompañantes. Puedes cancelar hasta{" "}
              {CANCELLATION_WINDOW_HOURS} horas antes del inicio.
            </p>

            <div className="mt-6">
              <CancelReservationButton reservationId={reservation.id} canCancel={canCancel} />
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (isUsedPass && reservation) {
    return (
      <main className="py-14 sm:py-20">
        <Container className="max-w-2xl">
          <h1 className="font-serif text-4xl italic">Ya utilizaste tu pase de esta semana</h1>
          <p className="mt-3 text-gray">
            Reservaste <strong>{reservation.experience.title}</strong>. Tu siguiente pase estará disponible el lunes{" "}
            {nextMondayLabel()}.
          </p>
          <div className="mt-8 flex gap-3">
            <LinkButton href="/historial">Ver mi historial</LinkButton>
            <LinkButton href="/experiencias" variant="outline">
              Explorar experiencias
            </LinkButton>
          </div>
        </Container>
      </main>
    );
  }

  const { data: allExperiences } = await getPublicExperiences(supabase);
  const recommendations = allExperiences
    .filter((e) => e.status === "published" && !isPast(e.starts_at))
    .slice(0, 3);

  return (
    <main className="py-14 sm:py-20">
      <Container>
        <h1 className="font-serif text-4xl italic">Tienes 1 pase disponible esta semana</h1>
        <p className="mt-3 max-w-xl text-gray">
          Elige una experiencia y reclama tu lugar. Tu pase se renueva cada lunes.
        </p>
        <LinkButton href="/experiencias" size="lg" className="mt-6">
          Explorar experiencias
        </LinkButton>

        {recommendations.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-semibold">Te podría interesar</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          </div>
        )}

        <p className="mt-10 text-sm text-gray">
          <Link href="/historial" className="underline">
            Ver mi historial de experiencias
          </Link>
        </p>
      </Container>
    </main>
  );
}
