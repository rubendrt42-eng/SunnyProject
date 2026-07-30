"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { FeaturedExperienceCard } from "@/components/experience/FeaturedExperienceCard";
import { QuickView } from "@/components/experience/QuickView";
import type { ExperienceCta } from "@/lib/experience-cta";
import type { ExperienceWithBusiness } from "@/lib/queries";

/**
 * The catalogue grid plus its quick view, with the open experience carried
 * in the URL as `?ver=<slug>`.
 *
 * Why the URL: the brief asks for a shareable quick view, and it also makes
 * the panel survive a refresh and lets the hero card link straight into an
 * open panel. Scroll position is preserved because every navigation here
 * uses `scroll: false` — the grid never jumps when the panel opens or
 * closes, which was the main thing the quick view existed to protect.
 *
 * Closing calls `router.back()` so the panel's own history entry is
 * consumed, keeping the hardware/gesture back button working as the close
 * gesture (the same contract QuickView already implements internally).
 */
export function CatalogGrid({
  featured,
  rest,
  soldOut,
  ctaByExperienceId,
  availableAssets,
}: {
  featured: ExperienceWithBusiness | null;
  rest: ExperienceWithBusiness[];
  soldOut: ExperienceWithBusiness[];
  ctaByExperienceId: Record<string, ExperienceCta["type"]>;
  availableAssets: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const verSlug = searchParams.get("ver");

  const all = [...(featured ? [featured] : []), ...rest, ...soldOut];
  const fromUrl = verSlug ? (all.find((e) => e.slug === verSlug) ?? null) : null;

  // Kept in state as well as read from the URL so the exit animation has
  // something to render on the frame after `ver` is dropped.
  //
  // Syncing happens during render via the "adjust state when a prop
  // changes" pattern rather than in an effect: an effect here would fire a
  // second render pass after the panel had already painted empty, and it is
  // what `react-hooks/set-state-in-effect` correctly objects to.
  const [selected, setSelected] = useState<ExperienceWithBusiness | null>(fromUrl);
  const [seenVer, setSeenVer] = useState(verSlug);

  if (verSlug !== seenVer) {
    setSeenVer(verSlug);
    if (fromUrl) setSelected(fromUrl);
  }

  const open = Boolean(fromUrl);

  const openQuickView = useCallback(
    (experience: ExperienceWithBusiness) => {
      setSelected(experience);
      const params = new URLSearchParams(searchParams.toString());
      params.set("ver", experience.slug);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeQuickView = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured && (
          <FeaturedExperienceCard experience={featured} availableAssets={availableAssets} onQuickView={openQuickView} />
        )}
        {rest.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            availableAssets={availableAssets}
            onQuickView={openQuickView}
          />
        ))}
      </div>

      {/* Sold-out experiences are kept, not hidden — they are still real
          plans someone may want to see — but they move below a divider so
          the grid above stays a list of things you can actually book
          (brief §24). */}
      {soldOut.length > 0 && (
        <section className="mt-14 border-t border-carbon/10 pt-10">
          <h2 className="text-heading text-carbon/70">
            Agotadas esta semana ({soldOut.length})
          </h2>
          <p className="mt-1 text-small text-gray">Se llenaron. Aparecen aquí para que sepas qué se está agotando rápido.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {soldOut.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                availableAssets={availableAssets}
                onQuickView={openQuickView}
              />
            ))}
          </div>
        </section>
      )}

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
