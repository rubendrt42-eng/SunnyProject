"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type { ExperienceWithBusiness } from "@/lib/queries";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, spotsLeft } from "@/lib/experience-status";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort, formatTime } from "@/lib/dates";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";
import { isOriginal, maxPartySizeOf, socialModesOf } from "@/lib/experience-flags";
import { Badge, OriginalSeal } from "@/components/ui/Badge";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SocialModes } from "@/components/ui/SocialModes";
import { ShareButton } from "@/components/experience/ShareButton";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { HoverLift } from "@/components/motion/HoverLift";
import { FloatingChip } from "@/components/motion/FloatingChip";

/**
 * The featured card: spans two columns, photograph beside the copy rather
 * than above it, and a larger title. Deliberately a different composition
 * from the standard card so the first item reads as the lead story instead
 * of just the first cell of a uniform grid.
 */
export function FeaturedExperienceCard({
  experience,
  availableAssets,
  onQuickView,
}: {
  experience: ExperienceWithBusiness;
  availableAssets: string[];
  onQuickView?: (experience: ExperienceWithBusiness) => void;
}) {
  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);
  const isDemo = isDemoExperience(experience);
  const title = displayTitle(experience.title);
  const maxParty = maxPartySizeOf(experience);

  return (
    <InViewReveal className="sm:col-span-2">
      <HoverLift lift={3}>
        <article className="group relative grid overflow-hidden rounded-lg border border-carbon/10 bg-warm-white sm:grid-cols-2">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-carbon/5 sm:aspect-auto">
            <ManagedPhoto
              url={experience.image_url}
              availableAssets={availableAssets}
              alt=""
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[var(--motion-enter)] ease-sunny group-hover:scale-[1.02]"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {isOriginal(experience) ? <OriginalSeal /> : <Badge tone="onPhoto">{categoryLabel(experience.category)}</Badge>}
              {isDemo && <Badge tone="orange">Demostración</Badge>}
            </div>
            {left > 0 && (state === "available" || state === "low") && (
              <div className="absolute right-3 bottom-3">
                <FloatingChip delay={0.15}>
                  {left} {left === 1 ? "lugar disponible" : "lugares disponibles"}
                </FloatingChip>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
            <Badge tone={EXPERIENCE_STATE_TONE[state]} className="w-fit">
              {state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state]}
            </Badge>

            <h2 className="text-title">
              <Link href={`/experiencias/${experience.slug}`} className="hover:underline">
                <span className="absolute inset-0 z-0" aria-hidden />
                {title}
              </Link>
            </h2>

            {experience.short_description && <p className="text-body text-gray">{experience.short_description}</p>}
            <p className="text-small text-gray">{experience.business.name}</p>

            <SocialModes modes={socialModesOf(experience)} max={3} />

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-small text-gray">
              <span>{formatDateShort(experience.starts_at)}</span>
              <span>{formatTime(experience.starts_at)}</span>
              {experience.location_name && <span>{experience.location_name}</span>}
              {maxParty > 1 && <span className="font-medium text-carbon">Hasta {maxParty} lugares</span>}
            </div>

            <div className="relative z-10 mt-2 flex flex-wrap items-center justify-between gap-2">
              {onQuickView ? (
                <button
                  type="button"
                  onClick={() => onQuickView(experience)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-small font-semibold text-carbon transition-colors hover:bg-carbon/5"
                >
                  <Eye aria-hidden size={15} strokeWidth={1.5} />
                  Vista rápida
                </button>
              ) : (
                <Link href={`/experiencias/${experience.slug}`} className="relative z-10 text-small font-semibold text-carbon hover:underline">
                  Ver experiencia
                </Link>
              )}
              <ShareButton url={`/experiencias/${experience.slug}`} title={title} variant="compact" />
            </div>
          </div>
        </article>
      </HoverLift>
    </InViewReveal>
  );
}
