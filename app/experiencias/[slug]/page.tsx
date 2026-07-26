import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExperienceBySlug, getExistingReservationForExperience, getActiveWeeklyReservation } from "@/lib/queries";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { determineCta } from "@/lib/experience-cta";
import { EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, computeExperienceState, spotsLeft } from "@/lib/experience-status";
import { categoryLabel } from "@/lib/constants";
import { formatDateTime, formatTime } from "@/lib/dates";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ClaimPanel } from "@/components/experience/ClaimPanel";

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

  return (
    <main className="py-10 sm:py-14">
      <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-carbon/5">
            <Image src={experience.image_url || "/images/placeholder-2.svg"} alt="" fill className="object-cover" priority />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{categoryLabel(experience.category)}</Badge>
            <Badge tone={EXPERIENCE_STATE_TONE[state]}>{EXPERIENCE_STATE_LABEL[state]}</Badge>
          </div>

          <h1 className="mt-4 font-serif text-4xl italic">{experience.title}</h1>
          <p className="mt-1 text-lg text-gray">{experience.business.name}</p>

          {experience.description && <p className="mt-6 whitespace-pre-line text-carbon">{experience.description}</p>}

          {experience.what_is_included.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Qué incluye</h2>
              <ul className="mt-2 list-inside list-disc text-carbon">
                {experience.what_is_included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {experience.requirements.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Requisitos</h2>
              <ul className="mt-2 list-inside list-disc text-carbon">
                {experience.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {experience.restrictions.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Restricciones</h2>
              <ul className="mt-2 list-inside list-disc text-carbon">
                {experience.restrictions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
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
              <a href={experience.maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-orange hover:underline">
                Ver en Google Maps →
              </a>
            )}
          </div>

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
    </main>
  );
}
