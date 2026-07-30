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
      {/* Destacada a lo ancho arriba, el resto en fila debajo.
          Antes eran dos columnas lado a lado (3/5 y 2/5): la destacada mide
          284 px y la pila de secundarias 829 px, así que la columna izquierda
          se quedaba con **544 px de vacío** debajo de la tarjeta, idéntico en
          1280, 1440 y 1920. La rejilla estiraba ambas columnas a la misma
          altura, por eso medir las columnas no delataba nada: el hueco estaba
          dentro. Apilando destacada + rejilla, la altura de una nunca depende
          de la otra y el vacío desaparece por construcción. */}
      <div className="flex flex-col gap-6">
        <FeaturedWeekCard experience={featured} onOpen={openQuickView} availableAssets={availableAssets} />
        {/* Dos columnas ya desde el móvil. En una sola, las cinco tarjetas
            verticales estiraban el bloque a 2712 px — más de tres pantallas de
            teléfono para una sección que se debería abarcar de un vistazo. */}
        {secondary.length > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
          {/* `aspect-[3/2]` y no `aspect-auto`: a lo ancho, dejar que la foto
              tomase la altura de la columna de texto la aplastaba a una
              franja de ~260 px que cortaba a la persona por la mitad. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-carbon/5 sm:aspect-[3/2]">
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
      {/* Vertical, not thumbnail-beside-text.
          The horizontal form worked when these lived in a narrow column
          stacked on top of each other. In a three-across grid the text half
          is only ~140 px, so the title truncated mid-word ("Run & Coffee …",
          "Recovery & Br…") and the venue line broke into three. Photo on top
          gives the title the full width of the card, and nothing needs an
          ellipsis to fit. */}
      <button
        type="button"
        onClick={() => onOpen(experience)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-carbon/10 bg-warm-white text-left transition-transform duration-150 hover:border-carbon/25 active:scale-[0.98]"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-carbon/5">
          <ManagedPhoto
            url={experience.image_url}
            availableAssets={availableAssets}
            alt=""
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge tone="neutral" className="bg-warm-white/90 px-2 py-0.5 text-[0.65rem]">
              {categoryLabel(experience.category)}
            </Badge>
            {isDemo && (
              <Badge tone="orange" className="px-2 py-0.5 text-[0.65rem]">
                Demostración
              </Badge>
            )}
          </div>
        </div>

        {/* `min-w-0` stays load-bearing: without it the metadata line below
            inflates this column's min-content width, which a parent grid
            honours and turns into horizontal page scroll on a phone. Caught
            by measuring min-content during QA — see SUNNY_DESIGN_QA_REPORT.md. */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
          {/* El cupo en su propia línea, ni junto al título ni sobre la foto.
              A dos columnas en un teléfono la tarjeta mide ~160 px: al lado
              del título lo partía en tres líneas ("Pádel / Mix- / In"), y
              sobre la foto chocaba con el badge de categoría de la esquina
              opuesta. En su propia fila tiene todo el ancho y no le quita
              nada a nadie. */}
          <Badge tone={EXPERIENCE_STATE_TONE[state]} className="px-2 py-0.5 text-[0.65rem]">
            {state === "available" || state === "low" ? `${left} ${left === 1 ? "lugar" : "lugares"}` : EXPERIENCE_STATE_LABEL[state]}
          </Badge>
          <p className="font-medium text-carbon">{displayTitle(experience.title)}</p>
          <p className="text-sm text-gray">{experience.business.name}</p>
          <p className="text-xs text-gray">
            {formatDateShort(experience.starts_at)} · {formatTime(experience.starts_at)}
            {experience.location_name ? ` · ${experience.location_name}` : ""}
          </p>
          <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-carbon">
            Vista rápida
            <AnimatedArrow className="text-carbon/50 group-hover:text-carbon" />
          </span>
        </div>
      </button>
    </InViewReveal>
  );
}
