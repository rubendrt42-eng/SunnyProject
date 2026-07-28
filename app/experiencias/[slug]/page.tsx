import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExperienceBySlug, getExistingReservationForExperience, getActiveWeeklyReservation } from "@/lib/queries";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { determineCta } from "@/lib/experience-cta";
import { listAvailableDemoAssets } from "@/lib/assets.server";
import { computeExperienceState, spotsLeft } from "@/lib/experience-status";
import { formatDateTime, formatTime } from "@/lib/dates";
import { Container } from "@/components/ui/Container";
import { ClaimPanel } from "@/components/experience/ClaimPanel";
import { DetailHero } from "@/components/experience/DetailHero";
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

  return (
    <main className="pb-24 lg:pb-14">
      <DetailHero experience={experience} state={state} availableAssets={availableAssets} />

      <Container className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          {experience.description && (
            <InViewReveal>
              <p className="whitespace-pre-line text-lg text-carbon">{experience.description}</p>
            </InViewReveal>
          )}

          <InViewReveal delay={0.05} className="mt-4">
            <AnimatedAccordion title="Qué incluye" items={experience.what_is_included} defaultOpen />
            <AnimatedAccordion title="Requisitos" items={experience.requirements} />
            <AnimatedAccordion title="Restricciones" items={experience.restrictions} />
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

          <p className="text-xs text-gray">
            El pase es individual, no transferible y no admite acompañantes. Puedes cancelar hasta 12 horas antes del
            inicio desde &quot;Mi pase&quot;.
          </p>
        </aside>
      </Container>

      <MobileClaimBar ctaType={cta.type} spotsLabel={spotsLabel} />
    </main>
  );
}
