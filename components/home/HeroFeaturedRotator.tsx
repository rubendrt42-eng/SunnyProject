"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Badge, OriginalSeal } from "@/components/ui/Badge";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, spotsLeft } from "@/lib/experience-status";
import { displayTitle, isDemoExperience } from "@/lib/demo-content";
import { isOriginal } from "@/lib/experience-flags";
import type { ExperienceWithBusiness } from "@/lib/queries";

const ROTATE_MS = 5000;

/**
 * The card overlapping the hero photograph: one real, currently-open
 * experience at a time, rotating every five seconds.
 *
 * Rules the brief is explicit about, and how they're met here:
 * - Rotates every 4–5s, never faster (ROTATE_MS = 5000).
 * - Stops on hover and on keyboard focus anywhere inside, so it is
 *   possible to actually read and click the card.
 * - Pills are real buttons with a 24px+ target, labelled for screen
 *   readers, so position is never conveyed by animation alone.
 * - `prefers-reduced-motion` freezes it on the first experience: the
 *   interval is not started at all, and the pills still work manually.
 * - Availability text comes from the reservation count, never fixed copy.
 */
export function HeroFeaturedRotator({ experiences }: { experiences: ExperienceWithBusiness[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const items = experiences.slice(0, 5);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  const experience = items[Math.min(index, items.length - 1)];
  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);
  const availability =
    state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state];

  return (
    <div
      className="mt-4 lg:absolute lg:-bottom-6 lg:-left-8 lg:mt-0 lg:w-[21rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="rounded-lg border border-carbon/10 bg-warm-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{categoryLabel(experience.category)}</Badge>
          {isOriginal(experience) && <OriginalSeal />}
          {isDemoExperience(experience.title) && <Badge tone="orange">Demostración</Badge>}
        </div>

        <h2 className="mt-3 text-heading">
          <Link href={`/experiencias/${experience.slug}`} className="hover:underline">
            {displayTitle(experience.title)}
          </Link>
        </h2>
        <p className="mt-1 text-small text-gray">{experience.business.name}</p>

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-gray">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Fecha</dt>
            <Calendar aria-hidden size={14} strokeWidth={1.5} />
            <dd>{formatDateShort(experience.starts_at)}</dd>
          </div>
          {experience.location_name && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Zona</dt>
              <MapPin aria-hidden size={14} strokeWidth={1.5} />
              <dd>{experience.location_name}</dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Disponibilidad</dt>
            <dd className="font-medium text-carbon">{availability}</dd>
          </div>
        </dl>

        <Link
          href={`/experiencias?ver=${experience.slug}`}
          className="mt-4 inline-flex text-small font-semibold text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
        >
          Ver experiencia
        </Link>

        {items.length > 1 && (
          <div className="mt-4 flex items-center gap-2 border-t border-carbon/10 pt-3">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver ${displayTitle(item.title)}`}
                aria-current={i === index}
                className="flex h-6 items-center px-0.5"
              >
                <span
                  className={
                    i === index
                      ? "block h-1.5 w-6 rounded-full bg-carbon transition-all"
                      : "block h-1.5 w-1.5 rounded-full bg-carbon/25 transition-all"
                  }
                />
              </button>
            ))}
            <span className="ml-auto text-label text-carbon/40">
              {index + 1}/{items.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
