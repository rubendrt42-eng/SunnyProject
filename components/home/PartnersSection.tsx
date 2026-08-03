"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Store } from "lucide-react";
import { categoryLabel } from "@/lib/constants";
import type { Business } from "@/lib/database.types";

/**
 * "Espacios que forman parte de Sunny" (brief §21).
 *
 * Two rules this section exists to obey:
 * 1. An active business does NOT appear automatically — it needs the
 *    explicit `featured_as_partner` flag (decision 9 in
 *    SUNNY_MVP_1_1_DECISIONS.md). The caller filters on that flag.
 * 2. If there are no real allies, the whole section is not rendered. There
 *    are no placeholder logos, and the word "patrocinadores" is not used:
 *    no sponsorship agreement exists.
 *
 * A business with no logo shows its name set in type instead of a fake
 * mark, so a missing asset never becomes an invented one.
 */
export function PartnersSection({ businesses }: { businesses: Business[] }) {
  const [paused, setPaused] = useState(false);

  if (businesses.length === 0) return null;

  // Only loop when there are enough logos that motion reads as a carousel
  // rather than a jitter.
  const shouldLoop = businesses.length >= 4;
  const run = shouldLoop ? [...businesses, ...businesses] : businesses;

  return (
    <div
      className="group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Aliados</p>
          <h2 className="mt-3 text-title">Espacios que forman parte de Sunny</h2>
        </div>
        {shouldLoop && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="text-small font-medium text-carbon/60 underline decoration-carbon/25 underline-offset-4 hover:text-carbon"
          >
            {paused ? "Reanudar" : "Pausar"}
          </button>
        )}
      </div>

      <div className="mask-fade-x mt-8 overflow-hidden">
        <ul
          className={
            shouldLoop
              ? "no-scrollbar flex w-max items-stretch gap-4 motion-safe:animate-marquee group-focus-within:[animation-play-state:paused]"
              : "no-scrollbar flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-2"
          }
          style={shouldLoop && paused ? { animationPlayState: "paused" } : undefined}
        >
          {run.map((business, i) => (
            <li key={`${business.id}-${i}`} className="w-56 shrink-0 snap-start">
              <Link
                href={`/experiencias?negocio=${business.slug}`}
                tabIndex={shouldLoop && i >= businesses.length ? -1 : undefined}
                aria-hidden={shouldLoop && i >= businesses.length}
                className="flex h-full flex-col gap-3 rounded-lg border border-carbon/10 bg-warm-white p-5 transition-colors hover:border-carbon/30"
              >
                <div className="relative flex h-12 items-center">
                  {business.logo_url ? (
                    <Image
                      src={business.logo_url}
                      alt={`Logotipo de ${business.name}`}
                      width={120}
                      height={48}
                      className="h-12 w-auto max-w-[120px] object-contain object-left"
                    />
                  ) : (
                    <span className="flex items-center gap-2 text-heading text-carbon/70">
                      <Store aria-hidden size={18} strokeWidth={1.5} />
                      {business.name}
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  <p className="text-small font-medium text-carbon">{business.name}</p>
                  <p className="text-small text-gray">{categoryLabel(business.category)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
