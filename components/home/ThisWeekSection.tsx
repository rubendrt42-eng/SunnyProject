"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { FloatingChip } from "@/components/motion/FloatingChip";
import { HoverLift } from "@/components/motion/HoverLift";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { AnimatedArrow } from "@/components/motion/AnimatedArrow";
import { QuickView } from "@/components/experience/QuickView";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort, formatTime } from "@/lib/dates";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, spotsLeft } from "@/lib/experience-status";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";
import type { ExperienceCta } from "@/lib/experience-cta";
import type { ExperienceWithBusiness } from "@/lib/queries";

/**
 * Post-hero editorial composition: one large featured story plus a
 * compact list of secondary picks — deliberately not a uniform grid, so
 * the "next thing to look at" is obvious. Tapping any card opens the
 * quick-view drawer/sheet instead of navigating away immediately.
 */
export function ThisWeekSection({
  experiences,
  ctaByExperienceId,
  availableAssets,
}: {
  experiences: ExperienceWithBusiness[];
  ctaByExperienceId: Record<string, ExperienceCta["type"]>;
  availableAssets: string[];
}) {
  const [selected, setSelected] = useState<ExperienceWithBusiness | null>(null);
  const [open, setOpen] = useState(false);

  const openQuickView = useCallback((experience: ExperienceWithBusiness) => {
    setSelected(experience);
    setOpen(true);
  }, []);

  const closeQuickView = useCallback(() => setOpen(false), []);

  if (experiences.length === 0) return null;

  const [featured, ...rest] = experiences;
  const secondary = rest.slice(0, 5);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <FeaturedWeekCard experience={featured} onOpen={openQuickView} availableAssets={availableAssets} className="lg:col-span-3" />
        {secondary.length > 0 && (
          <div className="flex flex-col gap-4 lg:col-span-2">
            {secondary.map((experience, i) => (
              <SecondaryWeekCard
                key={experience.id}
                experience={experience}
                onOpen={openQuickView}
                availableAssets={availableAssets}
                delay={i * 0.06}
              />
            ))}
          </div>
        )}
      </div>

      <QuickView
        experience={selected}
        cta={selected ? (ctaByExperienceId[selected.id] ?? null) : null}
        open={open}
        onClose={closeQuickView}
        availableAssets={availableAssets}
      />
    </>
  );
}

function FeaturedWeekCard({
  experience,
  onOpen,
  availableAssets,
  className,
}: {
  experience: ExperienceWithBusiness;
  onOpen: (experience: ExperienceWithBusiness) => void;
  availableAssets: string[];
  className?: string;
}) {
  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);
  const isDemo = isDemoExperience(experience.title);

  return (
    <InViewReveal className={className}>
      <HoverLift lift={3}>
        <button
          type="button"
          onClick={() => onOpen(experience)}
          className="group grid w-full overflow-hidden rounded-[20px] border border-carbon/10 bg-warm-white text-left transition-transform duration-150 active:scale-[0.98] sm:grid-cols-2"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-carbon/5 sm:aspect-auto">
            <ManagedPhoto
              url={experience.image_url}
              availableAssets={availableAssets}
              alt=""
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <Badge tone="neutral" className="bg-warm-white/90">
                {categoryLabel(experience.category)}
              </Badge>
              {isDemo && <Badge tone="orange">Demostración</Badge>}
            </div>
            {left > 0 && (state === "available" || state === "low") && (
              <div className="absolute right-3 bottom-3">
                <FloatingChip delay={0.1}>
                  {left} {left === 1 ? "lugar" : "lugares"}
                </FloatingChip>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
            <Badge tone={EXPERIENCE_STATE_TONE[state]} className="w-fit">
              {state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state]}
            </Badge>
            <h3 className="text-2xl leading-snug font-semibold sm:text-3xl">{displayTitle(experience.title)}</h3>
            <p className="text-gray">{experience.business.name}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray">
              <span>{formatDateShort(experience.starts_at)}</span>
              <span>{formatTime(experience.starts_at)}</span>
              <span>{experience.location_name}</span>
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-carbon">
              Vista rápida
              <AnimatedArrow />
            </span>
          </div>
        </button>
      </HoverLift>
    </InViewReveal>
  );
}

function SecondaryWeekCard({
  experience,
  onOpen,
  availableAssets,
  delay,
}: {
  experience: ExperienceWithBusiness;
  onOpen: (experience: ExperienceWithBusiness) => void;
  availableAssets: string[];
  delay: number;
}) {
  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);
  const isDemo = isDemoExperience(experience.title);

  return (
    <InViewReveal delay={delay}>
      <button
        type="button"
        onClick={() => onOpen(experience)}
        className="group flex w-full items-center gap-4 rounded-2xl border border-carbon/10 bg-warm-white p-3 text-left transition-transform duration-150 active:scale-[0.98] hover:border-carbon/25"
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-carbon/5 sm:h-24 sm:w-24">
          <ManagedPhoto
            url={experience.image_url}
            availableAssets={availableAssets}
            alt=""
            sizes="96px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        </div>
        {/* `overflow-hidden` alongside `min-w-0` is load-bearing, not
            decorative: without it the nowrap metadata line below gave this
            column a ~505px min-content width, which the parent grid honoured
            and turned into 150px of horizontal page scroll at 375px. Caught
            by measuring min-content during QA — see SUNNY_DESIGN_QA_REPORT.md. */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral" className="bg-carbon/6 px-2 py-0.5 text-[0.65rem]">
              {categoryLabel(experience.category)}
            </Badge>
            {isDemo && (
              <Badge tone="orange" className="px-2 py-0.5 text-[0.65rem]">
                Demostración
              </Badge>
            )}
          </div>
          <p className="truncate font-medium text-carbon">{displayTitle(experience.title)}</p>
          <p className="truncate text-sm text-gray">{experience.business.name}</p>
          {/* Wraps rather than truncates: on a phone the ellipsis was hiding
              the location, which is one of the things you most need to see. */}
          <p className="text-xs text-gray">
            {formatDateShort(experience.starts_at)} · {formatTime(experience.starts_at)}
            {experience.location_name ? ` · ${experience.location_name}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge tone={EXPERIENCE_STATE_TONE[state]} className="px-2 py-0.5 text-[0.65rem]">
            {state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state]}
          </Badge>
          <AnimatedArrow className="text-carbon/50 group-hover:text-carbon" />
        </div>
      </button>
    </InViewReveal>
  );
}
