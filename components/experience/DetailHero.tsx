import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Badge } from "@/components/ui/Badge";
import { categoryLabel } from "@/lib/constants";
import { EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, type ExperienceDisplayState } from "@/lib/experience-status";
import type { ExperienceWithBusiness } from "@/lib/queries";

export function DetailHero({ experience, state }: { experience: ExperienceWithBusiness; state: ExperienceDisplayState }) {
  return (
    <section className="relative isolate flex h-[56vh] min-h-[380px] flex-col justify-end overflow-hidden rounded-b-[2rem] text-warm-white sm:h-[62vh] sm:rounded-b-[3rem]">
      <ParallaxImage
        src={experience.image_url || "/images/placeholder-2.svg"}
        alt=""
        priority
        strength={0.05}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/25 to-carbon/10" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 sm:px-8 sm:pb-14">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className="bg-warm-white/90 text-carbon">
            {categoryLabel(experience.category)}
          </Badge>
          <Badge tone={EXPERIENCE_STATE_TONE[state]}>{EXPERIENCE_STATE_LABEL[state]}</Badge>
        </div>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] italic sm:text-6xl">{experience.title}</h1>
        <p className="mt-2 text-lg text-warm-white/85">{experience.business.name}</p>
      </div>
    </section>
  );
}
