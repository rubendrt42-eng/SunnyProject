"use client";

import Link from "next/link";
import { useRef, useState } from "react";

/**
 * The slow horizontal ribbon of real experience names (brief §14).
 *
 * Deliberate constraints:
 * - It is NOT navigation. The names are links as a convenience, but every
 *   destination is reachable from the catalogue and the cards below, so
 *   nothing depends on catching a moving target.
 * - It pauses on hover AND on keyboard focus anywhere inside
 *   (`focus-within`), so a keyboard user can actually read and click.
 * - It also pauses on an explicit toggle, because "hover to pause" is not
 *   available on touch and animation should never be unavoidable.
 * - `prefers-reduced-motion` stops the animation entirely (handled
 *   globally in globals.css), leaving a static, horizontally scrollable
 *   list — which is why the track is a real scroll container.
 * - The list is duplicated once and the keyframe translates -50%, which is
 *   what makes the loop seamless. The duplicate is aria-hidden so screen
 *   readers hear each experience once.
 */
export function ExperienceMarquee({ items }: { items: { slug: string; title: string }[] }) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  // Repeat enough times that even 2–3 experiences fill a wide viewport
  // before the loop point, then duplicate the whole run for the seam.
  const repeats = Math.max(2, Math.ceil(10 / items.length));
  const run = Array.from({ length: repeats }, () => items).flat();

  return (
    <div
      className="group relative border-y border-carbon/10 bg-warm-white py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mask-fade-x overflow-hidden">
        <div
          ref={trackRef}
          className="no-scrollbar flex w-max overflow-x-auto motion-safe:animate-marquee group-focus-within:[animation-play-state:paused]"
          style={paused ? { animationPlayState: "paused" } : undefined}
        >
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {run.map((item, i) => (
                <li key={`${copy}-${item.slug}-${i}`} className="flex items-center">
                  <Link
                    href={`/experiencias/${item.slug}`}
                    tabIndex={copy === 1 ? -1 : undefined}
                    className="px-5 text-label whitespace-nowrap text-carbon/70 transition-colors hover:text-carbon focus-visible:text-carbon"
                  >
                    {item.title}
                  </Link>
                  <span aria-hidden className="size-1 rounded-full bg-orange/60" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-warm-white/90 px-2 py-1 text-label text-carbon/50 opacity-0 transition-opacity hover:text-carbon focus-visible:opacity-100 group-hover:opacity-100"
      >
        {paused ? "Reanudar" : "Pausar"}
      </button>
    </div>
  );
}
