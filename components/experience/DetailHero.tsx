import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { Badge } from "@/components/ui/Badge";
import { categoryLabel } from "@/lib/constants";
import { EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, spotsLeft, type ExperienceDisplayState } from "@/lib/experience-status";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";
import { formatDateShort, formatTime } from "@/lib/dates";
import type { ExperienceWithBusiness } from "@/lib/queries";

export function DetailHero({
  experience,
  state,
  availableAssets,
}: {
  experience: ExperienceWithBusiness;
  state: ExperienceDisplayState;
  availableAssets: string[];
}) {
  const isDemo = isDemoExperience(experience);
  const left = spotsLeft(experience, experience.reserved_count);

  return (
    <section className="relative isolate flex h-[56vh] min-h-[380px] flex-col justify-end overflow-hidden text-warm-white sm:h-[62vh]">
      <ManagedPhoto url={experience.image_url} availableAssets={availableAssets} alt="" priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/30 to-carbon/10" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 sm:px-8 sm:pb-14">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className="bg-warm-white/90 text-carbon">
            {categoryLabel(experience.category)}
          </Badge>
          <Badge tone={EXPERIENCE_STATE_TONE[state]}>{EXPERIENCE_STATE_LABEL[state]}</Badge>
          {isDemo && <Badge tone="orange">Demostración</Badge>}
        </div>

        <h1 className="mt-4 max-w-2xl text-display text-balance">
          {displayTitle(experience.title)}
        </h1>
        <p className="mt-2 text-lg text-warm-white/85">{experience.business.name}</p>

        <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-warm-white/85">
          <div className="flex items-center gap-1.5">
            <Calendar aria-hidden size={16} />
            <dd>{formatDateShort(experience.starts_at)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock aria-hidden size={16} />
            <dd>{formatTime(experience.starts_at)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin aria-hidden size={16} />
            <dd>{experience.location_name}</dd>
          </div>
          {left > 0 && (state === "available" || state === "low") && (
            <div className="flex items-center gap-1.5">
              <Users aria-hidden size={16} />
              <dd>
                {left} {left === 1 ? "lugar" : "lugares"}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
