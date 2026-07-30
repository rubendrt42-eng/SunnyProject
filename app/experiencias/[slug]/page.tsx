import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExperienceBySlug, getExistingReservationForExperience, getActiveWeeklyReservation } from "@/lib/queries";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { determineCta } from "@/lib/experience-cta";
import { listAvailableDemoAssets } from "@/lib/assets.server";
import { computeExperienceState, spotsLeft } from "@/lib/experience-status";
import { maxPartySizeOf, socialModesOf } from "@/lib/experience-flags";
import { formatDateTime, formatTime } from "@/lib/dates";
import { displayTitle } from "@/lib/demo-content";
import { CANCELLATION_WINDOW_HOURS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { SocialModes } from "@/components/ui/SocialModes";
import { ClaimPanel } from "@/components/experience/ClaimPanel";
import { DetailHero } from "@/components/experience/DetailHero";
import { ShareButton } from "@/components/experience/ShareButton";
import { AnimatedAccordion } from "@/components/experience/AnimatedAccordion";
import { MobileClaimBar } from "@/components/experience/MobileClaimBar";
import { InViewReveal } from "@/components/motion/InViewReveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const experience = await getExperienceBySlug(supabase, slug);
  if (!experience) return { title: "Experiencia no encontrada — Sunny Project" };
  return { title: `${experience.title} — Sunny Project` };
}

export default async function ExperienceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { slug } = await params;
  const { source } = await searchParams;
  const supabase = await createClient();

  const experience = await getExperienceBySlug(supabase, slug);
  if (!experience) notFound();

  const user = await getCurrentUser();

  const [existingReservation, activeWeekly] = await Promise.all([
    user ? getExistingReservationForExperience(supabase, user.id, experience.id) : Promise.resolve(null),
    user ? getActiveWeeklyReservation(supabase, user.id) : Promise.resolve(null),
  ]);

  const cta = determineCta({
    experience,
    isAuthenticated: Boolean(user),
    isProfileComplete: isProfileComplete(user?.profile ?? null),
    hasReservationForThisExperience: Boolean(existingReservation),
    hasActivePassElsewhere: Boolean(activeWeekly) && activeWeekly?.experience_id !== experience.id,
  });

  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);
  const spotsLabel = left > 0 ? `${left} de ${experience.capacity} lugares disponibles` : "Experiencia agotada";
  const availableAssets = listAvailableDemoAssets();
  const modes = socialModesOf(experience);
  const maxParty = maxPartySizeOf(experience);

  return (
    <main className="pb-24 lg:pb-14">
      <DetailHero experience={experience} state={state} availableAssets={availableAssets} />

      <Container className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          {experience.description && (
            <InViewReveal>
              <p className="whitespace-pre-line text-body-l text-carbon">{experience.description}</p>
            </InViewReveal>
          )}

          {modes.length > 0 && (
            <InViewReveal delay={0.04} className="mt-6">
              <h2 className="text-label text-gray">Cómo es asistir</h2>
              <SocialModes modes={modes} max={6} className="mt-2" />
            </InViewReveal>
          )}

          {maxParty > 1 && (
            <InViewReveal delay={0.05} className="mt-6">
              <div className="rounded-lg bg-sunny/25 p-4">
                <p className="text-heading">Puedes venir acompañado</p>
                <p className="mt-1 text-small text-carbon/80">
                  Esta experiencia admite hasta {maxParty} lugares por reservación. Los eliges al reservar y se descuentan
                  del cupo. El pase sigue siendo tuyo y respondes por tu grupo.
                </p>
              </div>
            </InViewReveal>
          )}

          <InViewReveal delay={0.06} className="mt-6">
            <AnimatedAccordion title="Qué incluye" items={experience.what_is_included} defaultOpen />
            <AnimatedAccordion title="Qué llevar y requisitos" items={experience.requirements} />
            <AnimatedAccordion title="Restricciones" items={experience.restrictions} />
          </InViewReveal>

          {experience.instructions && (
            <InViewReveal delay={0.08} className="mt-6">
              <h2 className="text-heading">Instrucciones para llegar</h2>
              <p className="mt-2 whitespace-pre-line text-body text-carbon/80">{experience.instructions}</p>
            </InViewReveal>
          )}

          <InViewReveal delay={0.1} className="mt-8">
            <h2 className="text-heading">Política de cancelación</h2>
            <p className="mt-2 text-body text-carbon/80">
              Puedes cancelar desde &quot;Mi pase&quot; hasta {CANCELLATION_WINDOW_HOURS} horas antes del inicio y
              recuperas tu pase para reservar otra experiencia esa misma semana. Después de ese momento la reservación ya
              no se puede cancelar.
              {maxParty > 1 && " Al cancelar se libera la reservación completa, incluidos los lugares de tus acompañantes."}
            </p>
          </InViewReveal>

          <InViewReveal delay={0.12} className="mt-8 border-t border-carbon/10 pt-6">
            <h2 className="text-heading">Comparte esta experiencia</h2>
            <p className="mt-1 text-small text-gray">Manda el plan a alguien que quieras invitar.</p>
            <ShareButton
              className="mt-3"
              url={`/experiencias/${experience.slug}`}
              title={displayTitle(experience.title)}
            />
          </InViewReveal>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <InViewReveal>
            <div className="rounded-2xl border border-carbon/10 bg-warm-white p-6">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="font-medium text-gray">Fecha</dt>
                <dd>{formatDateTime(experience.starts_at)}</dd>
                <dt className="font-medium text-gray">Termina</dt>
                <dd>{formatTime(experience.ends_at)}</dd>
                <dt className="font-medium text-gray">Lugar</dt>
                <dd>{experience.location_name}</dd>
                {experience.address && (
                  <>
                    <dt className="font-medium text-gray">Dirección</dt>
                    <dd>{experience.address}</dd>
                  </>
                )}
                <dt className="font-medium text-gray">Cupos</dt>
                <dd>{left > 0 ? `${left} de ${experience.capacity} disponibles` : "Agotado"}</dd>
                <dt className="font-medium text-gray">Lugares por reservación</dt>
                <dd>{maxParty > 1 ? `Hasta ${maxParty}` : "1 (individual)"}</dd>
                <dt className="font-medium text-gray">Cierre de reservación</dt>
                <dd>{formatDateTime(experience.claim_closes_at)}</dd>
              </dl>
              {experience.maps_url && (
                <a
                  href={experience.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-orange hover:underline"
                >
                  Ver en Google Maps →
                </a>
              )}
            </div>
          </InViewReveal>

          <ClaimPanel
            experienceId={experience.id}
            experienceSlug={experience.slug}
            initialCta={cta.type}
            source={source ?? null}
          />

          {/* Was: "El pase es individual, no transferible y no admite
              acompañantes." That is no longer true — companions are a
              per-experience allowance Emmy configures — so the copy now
              states the actual rule for THIS experience (brief §39). */}
          <p className="text-small text-gray">
            {maxParty > 1
              ? `Esta experiencia admite hasta ${maxParty} lugares por reservación. El pase es personal y no transferible: respondes por tu grupo.`
              : "El pase es personal y no transferible. Esta experiencia es de un lugar por reservación."}{" "}
            Puedes cancelar hasta {CANCELLATION_WINDOW_HOURS} horas antes del inicio desde &quot;Mi pase&quot;.
          </p>
        </aside>
      </Container>

      <MobileClaimBar ctaType={cta.type} spotsLabel={spotsLabel} />
    </main>
  );
}
