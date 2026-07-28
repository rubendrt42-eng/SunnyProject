"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { Badge } from "@/components/ui/Badge";
import { CTA_LABEL } from "@/lib/experience-cta";
import { categoryLabel } from "@/lib/constants";
import { displayTitle } from "@/lib/demo-content";
import { spotsLeft } from "@/lib/experience-status";
import type { ExperienceWithBusiness } from "@/lib/queries";

const STEPS = [
  {
    number: "01",
    title: "Descubre",
    body: "Explora experiencias seleccionadas de movimiento, recovery, cafés, outdoor y comunidad.",
  },
  {
    number: "02",
    title: "Reclama",
    body: "Utiliza tu pase semanal antes de que se agoten los lugares.",
  },
  {
    number: "03",
    title: "Vive",
    body: "Presenta tu folio, disfruta la experiencia y vuelve la siguiente semana.",
  },
] as const;

/** Real experience cards when there's data; a quiet neutral skeleton (never invented names) when there isn't. */
function CatalogVisual({ experiences, availableAssets }: { experiences: ExperienceWithBusiness[]; availableAssets: string[] }) {
  if (experiences.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl bg-carbon/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {experiences.slice(0, 2).map((exp) => (
        <div key={exp.id} className="overflow-hidden rounded-2xl border border-carbon/10 bg-warm-white shadow-sm">
          <div className="relative aspect-[4/3] w-full">
            <ManagedPhoto url={exp.image_url} availableAssets={availableAssets} alt="" sizes="180px" className="object-cover" />
          </div>
          <div className="p-2.5">
            <p className="truncate text-xs font-medium text-carbon">{displayTitle(exp.title)}</p>
            <p className="mt-0.5 truncate text-[0.7rem] text-gray">{categoryLabel(exp.category)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Real cupos math from an actual experience when available, generic numbers otherwise — never a stat that looks real but isn't. */
function CapacityVisual({ experience }: { experience: ExperienceWithBusiness | null }) {
  const capacity = experience?.capacity ?? 10;
  const left = experience ? spotsLeft(experience, experience.reserved_count) : 7;
  const reserved = capacity - left;
  const pct = capacity > 0 ? Math.min(100, Math.round((reserved / capacity) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-carbon/10 bg-warm-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-carbon">{experience ? displayTitle(experience.title) : "Tu experiencia"}</span>
        <Badge tone="orange">
          {left} {left === 1 ? "lugar" : "lugares"}
        </Badge>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-carbon/10">
        <div className="h-full rounded-full bg-orange" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray">
        {reserved} de {capacity} lugares reservados
      </p>
      <div className="mt-4 flex h-[38px] items-center justify-center rounded-xl bg-sunny px-4 text-sm font-medium text-carbon">
        {CTA_LABEL.claimable}
      </div>
    </div>
  );
}

function PassVisual() {
  return (
    <div className="rounded-2xl bg-carbon p-5 text-warm-white shadow-sm">
      <p className="text-xs tracking-widest text-warm-white/50 uppercase">Pase Sunny</p>
      <p className="mt-2 font-mono text-lg tracking-wide">SUN-XXXXXX</p>
      <div className="mt-4 h-px w-full bg-warm-white/15" />
      <p className="mt-4 text-sm text-warm-white/70">Presenta tu nombre y folio al llegar.</p>
    </div>
  );
}

export function HowItWorksNarrative({
  experiences,
  availableAssets,
}: {
  experiences: ExperienceWithBusiness[];
  availableAssets: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length));
    setActive(idx);
  });

  const visuals = [
    <CatalogVisual key="catalog" experiences={experiences} availableAssets={availableAssets} />,
    <CapacityVisual key="capacity" experience={experiences[0] ?? null} />,
    <PassVisual key="pass" />,
  ];

  return (
    <>
      {/* Desktop: sticky scroll narrative */}
      <div ref={containerRef} className="relative hidden lg:block" style={{ height: `${STEPS.length * 60}vh` }}>
        <div className="sticky top-24 mx-auto grid max-w-6xl grid-cols-[2px_1fr_1fr] gap-12 px-8">
          <div className="relative h-[40vh] self-center rounded-full bg-carbon/10">
            <motion.div
              className="absolute inset-x-0 top-0 origin-top rounded-full bg-orange"
              style={{ scaleY: scrollYProgress, height: "100%" }}
            />
          </div>

          <div className="flex flex-col justify-center gap-10">
            {STEPS.map((step, i) => (
              <div key={step.number} className={clsx("transition-opacity duration-500", active === i ? "opacity-100" : "opacity-55")}>
                <span className="text-4xl font-semibold text-orange">{step.number}</span>
                <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-sm text-gray">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {visuals[active]}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked reveal, visual directly under each step */}
      <div className="flex flex-col gap-12 lg:hidden">
        {STEPS.map((step, i) => (
          <InViewReveal key={step.number}>
            <span className="text-4xl font-semibold text-orange">{step.number}</span>
            <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-sm text-gray">{step.body}</p>
            <div className="mt-5">{visuals[i]}</div>
          </InViewReveal>
        ))}
      </div>
    </>
  );
}
