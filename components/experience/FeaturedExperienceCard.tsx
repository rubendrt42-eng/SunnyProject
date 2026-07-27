import Link from "next/link";
import Image from "next/image";
import type { ExperienceWithBusiness } from "@/lib/queries";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, spotsLeft } from "@/lib/experience-status";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort, formatTime } from "@/lib/dates";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";
import { Badge } from "@/components/ui/Badge";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { HoverLift } from "@/components/motion/HoverLift";
import { AnimatedArrow } from "@/components/motion/AnimatedArrow";
import { FloatingChip } from "@/components/motion/FloatingChip";

/** Larger, two-column editorial treatment for the featured experience at the top of the catalog. */
export function FeaturedExperienceCard({ experience }: { experience: ExperienceWithBusiness }) {
  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);
  const isDemo = isDemoExperience(experience.title);

  return (
    <InViewReveal className="sm:col-span-2">
      <HoverLift lift={4}>
        <Link
          href={`/experiencias/${experience.slug}`}
          className="group grid overflow-hidden rounded-2xl border border-carbon/10 bg-warm-white sm:grid-cols-2"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-carbon/5 sm:aspect-auto">
            <Image
              src={experience.image_url || "/images/placeholder-1.svg"}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <Badge tone="neutral" className="bg-warm-white/90">
                {categoryLabel(experience.category)}
              </Badge>
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
            <h2 className="font-serif text-3xl leading-snug italic sm:text-4xl">{displayTitle(experience.title)}</h2>
            <p className="text-gray">{experience.business.name}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray">
              <span>{formatDateShort(experience.starts_at)}</span>
              <span>{formatTime(experience.starts_at)}</span>
              <span>{experience.location_name}</span>
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-carbon">
              Ver experiencia
              <AnimatedArrow />
            </span>
          </div>
        </Link>
      </HoverLift>
    </InViewReveal>
  );
}
