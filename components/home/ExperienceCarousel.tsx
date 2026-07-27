"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { Badge } from "@/components/ui/Badge";
import { AnimatedArrow } from "@/components/motion/AnimatedArrow";
import { CarouselDots } from "@/components/motion/CarouselDots";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import { spotsLeft } from "@/lib/experience-status";
import type { ExperienceWithBusiness } from "@/lib/queries";

const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 60;

export function ExperienceCarousel({ experiences }: { experiences: ExperienceWithBusiness[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const count = experiences.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

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
    }, AUTOPLAY_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prefersReducedMotion, paused, tabHidden, count]);

  if (count === 0) return null;

  const experience = experiences[index];
  const left = spotsLeft(experience, experience.reserved_count);

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) prev();
    else if (info.offset.x < -SWIPE_THRESHOLD) next();
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Experiencias destacadas"
    >
      <div className="overflow-hidden rounded-3xl border border-carbon/10 bg-warm-white">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={experience.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid touch-pan-y grid-cols-1 lg:grid-cols-2"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto">
              <Image
                src={experience.image_url || "/images/placeholder-3.svg"}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="pointer-events-none object-cover"
              />
            </div>

            <div className="flex flex-col justify-center gap-3 p-8 sm:p-12">
              <Badge tone="sunny" className="w-fit">
                {categoryLabel(experience.category)}
              </Badge>
              <h3 className="font-serif text-3xl italic sm:text-4xl">{experience.title}</h3>
              <p className="text-gray">{experience.business.name}</p>
              <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray">
                <div>
                  <dt className="sr-only">Fecha</dt>
                  <dd>{formatDateShort(experience.starts_at)}</dd>
                </div>
                <div>
                  <dt className="sr-only">Zona</dt>
                  <dd>{experience.location_name}</dd>
                </div>
                <div>
                  <dt className="sr-only">Cupos</dt>
                  <dd>{left > 0 ? `${left} lugares` : "Agotada"}</dd>
                </div>
              </dl>
              <Link
                href={`/experiencias/${experience.slug}`}
                className="group mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-carbon"
              >
                Ver experiencia
                <AnimatedArrow />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <CarouselDots count={count} activeIndex={index} onSelect={goTo} label="experiencia destacada" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Experiencia anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-carbon/15 hover:border-carbon"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 rotate-180">
                <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente experiencia"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-carbon/15 hover:border-carbon"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
