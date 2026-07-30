"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type { ExperienceWithBusiness } from "@/lib/queries";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, spotsLeft } from "@/lib/experience-status";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort, formatTime } from "@/lib/dates";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";
import { isOriginal, socialModesOf } from "@/lib/experience-flags";
import { Badge, OriginalSeal } from "@/components/ui/Badge";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SocialModes } from "@/components/ui/SocialModes";
import { ShareButton } from "@/components/experience/ShareButton";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { HoverLift } from "@/components/motion/HoverLift";

/**
 * The standard catalogue card: photograph on top, text below it (not
 * overlaid) — that is what separates it visually from the featured card,
 * which does overlay. Aspect is 4:5 to match the real photography rather
 * than cropping every image to landscape.
 *
 * The card is a link to the full page, so it works without JS and is
 * crawlable. Quick view and share are separate real buttons layered on
 * top — never nested inside the anchor, which would be invalid markup and
 * would hijack the link's activation.
 */
export function ExperienceCard({
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
  const isDemo = isDemoExperience(experience.title);
  const title = displayTitle(experience.title);

  return (
    <InViewReveal>
      <HoverLift lift={3}>
        <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-carbon/10 bg-warm-white transition-shadow hover:shadow-lg">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-carbon/5">
            <ManagedPhoto
              url={experience.image_url}
              availableAssets={availableAssets}
              alt=""
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {isOriginal(experience) ? <OriginalSeal /> : <Badge tone="onPhoto">{categoryLabel(experience.category)}</Badge>}
              {isDemo && <Badge tone="orange">Demostración</Badge>}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5">
            <Badge tone={EXPERIENCE_STATE_TONE[state]} className="w-fit">
              {state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state]}
            </Badge>

            <h3 className="text-heading">
              <Link href={`/experiencias/${experience.slug}`} className="hover:underline">
                {/* Stretched hit area: the whole card is clickable, while the
                    buttons below sit above it with their own z-index. */}
                <span className="absolute inset-0 z-0" aria-hidden />
                {title}
              </Link>
            </h3>

            <p className="text-small text-gray">{experience.business.name}</p>

            <SocialModes modes={socialModesOf(experience)} max={2} className="mt-1" />

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-small text-gray">
              <span>{formatDateShort(experience.starts_at)}</span>
              <span>{formatTime(experience.starts_at)}</span>
              {experience.location_name && <span>{experience.location_name}</span>}
            </div>

            <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
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
                <Link
                  href={`/experiencias/${experience.slug}`}
                  className="relative z-10 text-small font-semibold text-carbon hover:underline"
                >
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
