"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { EASE, MOTION } from "@/lib/motion";
import { LinkButton } from "@/components/ui/Button";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { CATEGORIES } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import { spotsLeft } from "@/lib/experience-status";
import { displayTitle } from "@/lib/demo-content";
import type { Category } from "@/lib/database.types";
import type { ExperienceWithBusiness } from "@/lib/queries";

const CATEGORY_COPY: Record<Category, string> = {
  movimiento: "Pilates, yoga y clases que despiertan el cuerpo antes de que empiece el día.",
  recovery: "Contraste frío-calor, sauna y rituales para que el cuerpo se recupere de verdad.",
  food_coffee: "Cafés de especialidad y catas para paladares curiosos.",
  outdoor: "Aire libre, agua y movimiento fuera de las cuatro paredes de siempre.",
  comunidad: "Planes para conocer gente nueva mientras haces algo distinto.",
};

/** Stable cover photo per category — independent of which experience happens to be published this week. */
/**
 * Cover photo per category, pointing at the committed Sunny media library.
 *
 * These used to point at /demo-assets/*.webp, files deleted two phases ago —
 * so every category tile rendered the "missing photo" state. Caught in QA
 * screenshots, where the panel showed an empty box even for a category that
 * does have photography.
 *
 * `outdoor` is deliberately absent: nothing in the attached assets depicts an
 * outdoor experience (see SUNNY_ASSET_MANIFEST.md §6), so it keeps the honest
 * missing-photo state rather than borrowing an unrelated image.
 */
const CATEGORY_COVER: Partial<Record<Category, string>> = {
  movimiento: "/media/sunny/categories/category-movimiento-01.webp",
  recovery: "/media/sunny/experiences/experience-recovery-breathwork-01.webp",
  food_coffee: "/media/sunny/categories/category-food-coffee-01.webp",
  comunidad: "/media/sunny/community/community-gathering-01.webp",
};

/**
 * Interactive category switcher: photo, copy, and the related-experiences
 * list all update client-side from the same `experiences` list already
 * fetched on the server — no extra fetch, no full page reload.
 */
export function CategoriesSection({
  experiences,
  availableAssets,
}: {
  experiences: ExperienceWithBusiness[];
  availableAssets: string[];
}) {
  const [active, setActive] = useState<Category>(CATEGORIES[0].value);

  const activeExperiences = experiences.filter((e) => e.category === active).slice(0, 3);
  const activeLabel = CATEGORIES.find((c) => c.value === active)?.label ?? "";

  return (
    <div>
      <nav aria-label="Categorías" className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setActive(c.value)}
            aria-pressed={active === c.value}
            className={clsx(
              "shrink-0 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors duration-[var(--motion-nudge)]",
              active === c.value ? "border-carbon bg-carbon text-warm-white" : "border-carbon/15 hover:border-carbon",
            )}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: MOTION.panel, ease: EASE }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl"
          >
            <ManagedPhoto url={CATEGORY_COVER[active]} availableAssets={availableAssets} alt="" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: MOTION.panel, delay: 0.05, ease: EASE }}
          >
            <h3 className="text-subtitle">{activeLabel}</h3>
            <p className="mt-2 max-w-md text-gray">{CATEGORY_COPY[active]}</p>

            {activeExperiences.length > 0 ? (
              <ul className="mt-6 flex flex-col gap-3">
                {activeExperiences.map((exp) => {
                  const left = spotsLeft(exp, exp.reserved_count);
                  return (
                    <li key={exp.id}>
                      <Link
                        href={`/experiencias/${exp.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-carbon/10 bg-warm-white px-4 py-3 text-sm hover:border-carbon/25"
                      >
                        <span className="truncate">
                          {displayTitle(exp.title)} · {formatDateShort(exp.starts_at)}
                        </span>
                        <span className="shrink-0 text-xs text-gray">{left > 0 ? `${left} lugares` : "Agotado"}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-gray">Aún no hay experiencias publicadas en esta categoría.</p>
            )}

            <LinkButton href={`/experiencias?categoria=${active}`} variant="secondary" arrow className="mt-6">
              Explorar {activeLabel.toLowerCase()}
            </LinkButton>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
