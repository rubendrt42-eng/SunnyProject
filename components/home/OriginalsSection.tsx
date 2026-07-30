import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { Badge, OriginalSeal } from "@/components/ui/Badge";
import { SocialModes } from "@/components/ui/SocialModes";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { formatDateShort, formatTime } from "@/lib/dates";
import { displayTitle, isDemoExperience } from "@/lib/demo-content";
import { socialModesOf } from "@/lib/experience-flags";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, spotsLeft } from "@/lib/experience-status";
import { ORIGINALS_FALLBACK_PHOTO } from "@/lib/media";
import type { ExperienceWithBusiness } from "@/lib/queries";

/**
 * Sunny Originals (brief §20): experiences curated or run by Sunny itself
 * rather than by a partner space.
 *
 * This section renders only when at least one real experience is flagged
 * `is_original`. That flag is set by Emmy in the panel and comes from the
 * presentation migration — so before that migration runs, or before she
 * marks anything, the section is simply absent. No placeholder Original is
 * invented to fill the space, for the same reason the allies section stays
 * hidden without real allies.
 *
 * Visual treatment is the contrast chapter: carbon background, pine seal,
 * photography bled to one side.
 */
export function OriginalsSection({
  experiences,
  availableAssets,
}: {
  experiences: ExperienceWithBusiness[];
  availableAssets: string[];
}) {
  if (experiences.length === 0) return null;

  const [lead, ...rest] = experiences;

  return (
    <div>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <InViewReveal>
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-warm-white/10 sm:aspect-3/2 lg:aspect-4/5">
            {lead.image_url ? (
              <ManagedPhoto
                url={lead.image_url}
                availableAssets={availableAssets}
                alt=""
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            ) : (
              <Image
                src={ORIGINALS_FALLBACK_PHOTO.src}
                alt={ORIGINALS_FALLBACK_PHOTO.alt}
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </InViewReveal>

        <div>
          <InViewReveal delay={0.08}>
            <p className="eyebrow">Sunny Originals</p>
            <h2 className="mt-4 text-title text-warm-white">Los planes que Sunny organiza.</h2>
            <p className="mt-4 max-w-md text-body-l text-warm-white/70">
              Encuentros creados y guiados por Sunny, pensados para que llegar solo sea la forma más fácil de conocer a
              alguien.
            </p>
          </InViewReveal>

          <InViewReveal delay={0.14}>
            <article className="mt-8 rounded-lg border border-warm-white/15 bg-warm-white/5 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <OriginalSeal />
                {isDemoExperience(lead.title) && <Badge tone="orange">Demostración</Badge>}
              </div>

              <h3 className="mt-3 text-subtitle text-warm-white">{displayTitle(lead.title)}</h3>
              {lead.short_description && (
                <p className="mt-2 text-small text-warm-white/70">{lead.short_description}</p>
              )}

              <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-warm-white/70">
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Fecha y hora</dt>
                  <Calendar aria-hidden size={14} strokeWidth={1.5} />
                  <dd>
                    {formatDateShort(lead.starts_at)} · {formatTime(lead.starts_at)}
                  </dd>
                </div>
                {lead.location_name && (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Zona</dt>
                    <MapPin aria-hidden size={14} strokeWidth={1.5} />
                    <dd>{lead.location_name}</dd>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Disponibilidad</dt>
                  <dd className="font-medium text-sunny">{availabilityLabel(lead)}</dd>
                </div>
              </dl>

              <SocialModes modes={socialModesOf(lead)} onPhoto max={3} className="mt-4" />

              <Link
                href={`/experiencias/${lead.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-small font-semibold text-sunny underline decoration-sunny/40 underline-offset-4 hover:decoration-sunny"
              >
                Ver experiencia
                <ArrowRight aria-hidden size={14} />
              </Link>
            </article>
          </InViewReveal>

          {rest.length > 0 && (
            <InViewReveal delay={0.2}>
              <ul className="mt-4 flex flex-col gap-2">
                {rest.slice(0, 3).map((experience) => (
                  <li key={experience.id}>
                    <Link
                      href={`/experiencias/${experience.slug}`}
                      className="flex items-center justify-between gap-4 rounded-md border border-warm-white/10 px-4 py-3 text-small text-warm-white/80 transition-colors hover:border-warm-white/30 hover:text-warm-white"
                    >
                      <span>{displayTitle(experience.title)}</span>
                      <span className="shrink-0 text-warm-white/50">{formatDateShort(experience.starts_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </InViewReveal>
          )}
        </div>
      </div>
    </div>
  );
}

function availabilityLabel(experience: ExperienceWithBusiness): string {
  const state = computeExperienceState(experience, experience.reserved_count);
  if (state !== "available" && state !== "low") return EXPERIENCE_STATE_LABEL[state];
  const left = spotsLeft(experience, experience.reserved_count);
  return `${left} ${left === 1 ? "lugar" : "lugares"}`;
}
