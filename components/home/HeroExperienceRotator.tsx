"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { Badge } from "@/components/ui/Badge";
import { QuickView } from "@/components/experience/QuickView";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, spotsLeft } from "@/lib/experience-status";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";
import type { ExperienceCta } from "@/lib/experience-cta";
import type { ExperienceWithBusiness } from "@/lib/queries";

const ROTATE_MS = 4500;
const SWIPE_THRESHOLD = 50;

/**
 * Replaces the old static HeroFeaturedCard. Cycles through 4-5 real
 * upcoming experiences instead of always showing the same one. Tapping the
 * card opens the same QuickView used elsewhere (its own instance — see
 * VISUAL_CORRECTION_PLAN.md §8 on why that's safe).
 */
export function HeroExperienceRotator({
  experiences,
  ctaByExperienceId,
  availableAssets,
}: {
  experiences: ExperienceWithBusiness[];
  ctaByExperienceId: Record<string, ExperienceCta["type"]>;
  availableAssets: string[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const count = experiences.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    function handleVisibility() {
      setTabHidden(document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || paused || tabHidden || count <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prefersReducedMotion, paused, tabHidden, count]);

  if (count === 0) return null;

  const experience = experiences[index];
  const left = spotsLeft(experience, experience.reserved_count);
  const state = computeExperienceState(experience, experience.reserved_count);
  const isDemo = isDemoExperience(experience.title);

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) goTo(index - 1);
    else if (info.offset.x < -SWIPE_THRESHOLD) goTo(index + 1);
  }

  return (
    <div className="w-full max-w-sm shrink-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        className="relative overflow-hidden rounded-2xl bg-warm-white text-carbon shadow-lg"
        role="region"
        aria-roledescription="carousel"
        aria-label="Experiencia destacada de esta semana"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.button
            key={experience.id}
            type="button"
            onClick={() => setQuickViewOpen(true)}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full touch-pan-y flex-col text-left"
          >
            <div className="relative aspect-[4/3] w-full">
              <ManagedPhoto url={experience.image_url} availableAssets={availableAssets} alt="" sizes="384px" className="object-cover" />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <Badge tone="neutral" className="bg-warm-white/90">
                  {categoryLabel(experience.category)}
                </Badge>
                {isDemo && <Badge tone="orange">Demostración</Badge>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 p-5">
              <Badge tone={EXPERIENCE_STATE_TONE[state]} className="w-fit">
                {state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state]}
              </Badge>
              <p className="text-lg leading-snug font-semibold">{displayTitle(experience.title)}</p>
              <p className="text-sm text-gray">{experience.business.name}</p>
              <div className="mt-1 flex items-center justify-between gap-3 text-sm text-gray">
                <span className="truncate">{formatDateShort(experience.starts_at)}</span>
                <span className="truncate">{experience.location_name}</span>
              </div>
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Seleccionar experiencia">
            {experiences.map((exp, i) => (
              <button
                key={exp.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Ver experiencia ${i + 1}`}
                onClick={() => goTo(i)}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-6 bg-warm-white" : "w-1.5 bg-warm-white/40",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Experiencia anterior"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-warm-white/30 text-warm-white transition-colors hover:border-warm-white/70"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Siguiente experiencia"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-warm-white/30 text-warm-white transition-colors hover:border-warm-white/70"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <QuickView
        experience={experience}
        cta={ctaByExperienceId[experience.id] ?? null}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        availableAssets={availableAssets}
      />
    </div>
  );
}
