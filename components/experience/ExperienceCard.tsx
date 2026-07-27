import Link from "next/link";
import Image from "next/image";
import type { ExperienceWithBusiness } from "@/lib/queries";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, spotsLeft } from "@/lib/experience-status";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import { Badge } from "@/components/ui/Badge";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { HoverLift } from "@/components/motion/HoverLift";
import { AnimatedArrow } from "@/components/motion/AnimatedArrow";

export function ExperienceCard({ experience }: { experience: ExperienceWithBusiness }) {
  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);

  return (
    <InViewReveal>
      <HoverLift lift={6}>
        <Link
          href={`/experiencias/${experience.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-carbon/10 bg-warm-white transition-shadow hover:shadow-lg"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-carbon/5">
            <Image
              src={experience.image_url || "/images/placeholder-1.svg"}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge tone="neutral" className="bg-warm-white/90">
                {categoryLabel(experience.category)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5">
            <Badge tone={EXPERIENCE_STATE_TONE[state]} className="w-fit">
              {state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state]}
            </Badge>
            <h3 className="font-serif text-xl leading-snug">{experience.title}</h3>
            <p className="text-sm text-gray">{experience.business.name}</p>
            <div className="mt-auto flex items-center justify-between pt-3 text-sm text-gray">
              <span>{formatDateShort(experience.starts_at)}</span>
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
