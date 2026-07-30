"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Link2, RotateCcw, Share2 } from "lucide-react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { Badge } from "@/components/ui/Badge";
import { CTA_LABEL } from "@/lib/experience-cta";
import { categoryLabel } from "@/lib/constants";
import { displayTitle } from "@/lib/demo-content";
import { maxPartySizeOf } from "@/lib/experience-flags";
import { spotsLeft } from "@/lib/experience-status";
import type { ExperienceWithBusiness } from "@/lib/queries";

const STEPS = [
  {
    number: "01",
    title: "Descubre",
    body: "Encuentra experiencias seleccionadas para esta semana.",
  },
  {
    number: "02",
    title: "Invita o llega solo",
    body: "Comparte el plan, lleva a alguien cuando esté permitido o atrévete a llegar solo.",
  },
  {
    number: "03",
    title: "Reserva",
    body: "Utiliza tu pase y asegura tus lugares antes de que se terminen.",
  },
  {
    number: "04",
    title: "Vive",
    body: "Presenta tu folio y disfruta la experiencia.",
  },
  {
    number: "05",
    title: "Comparte y regresa",
    body: "Cuenta cómo te fue y descubre lo que viene la siguiente semana.",
  },
] as const;

/** Real experience cards when there's data; a quiet neutral skeleton (never invented names) when there isn't. */
function CatalogVisual({ experiences, availableAssets }: { experiences: ExperienceWithBusiness[]; availableAssets: string[] }) {
  if (experiences.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-carbon/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {experiences.slice(0, 2).map((exp) => (
        <div key={exp.id} className="overflow-hidden rounded-xl border border-carbon/10 bg-warm-white shadow-sm">
          <div className="relative aspect-[4/3] w-full">
            <ManagedPhoto url={exp.image_url} availableAssets={availableAssets} alt="" sizes="180px" className="object-cover" />
          </div>
          <div className="p-2.5">
            <p className="truncate text-xs font-medium text-carbon">{displayTitle(exp.title)}</p>
            <p className="mt-0.5 truncate text-label text-gray">{categoryLabel(exp.category)}</p>
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
    <div className="rounded-xl border border-carbon/10 bg-warm-white p-5 shadow-sm">
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
    <div className="rounded-lg bg-carbon p-5 text-warm-white shadow-sm">
      <p className="text-label text-warm-white/50">Pase Sunny</p>
      <p className="mt-2 font-mono text-lg tracking-wide">SUN-XXXXXX</p>
      <div className="mt-4 h-px w-full bg-warm-white/15" />
      <p className="mt-4 text-small text-warm-white/70">Presenta tu nombre y folio al llegar.</p>
    </div>
  );
}

/**
 * Step 02 is about who you go with. Shows the real share affordances the
 * app actually has (WhatsApp, copy link) and the companion rule — it never
 * promises invitations the product doesn't send.
 */
function InviteVisual({ experience }: { experience: ExperienceWithBusiness | null }) {
  const max = experience ? maxPartySizeOf(experience) : 1;

  return (
    <div className="rounded-lg border border-carbon/10 bg-warm-white p-5 shadow-sm">
      <p className="text-small font-semibold text-carbon">
        {experience ? displayTitle(experience.title) : "Una experiencia de esta semana"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-carbon/15 px-3 py-1.5 text-small text-carbon/75">
          <Share2 aria-hidden size={14} strokeWidth={1.5} />
          Compartir
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-carbon/15 px-3 py-1.5 text-small text-carbon/75">
          <Link2 aria-hidden size={14} strokeWidth={1.5} />
          Copiar enlace
        </span>
      </div>
      <p className="mt-4 text-small text-gray">
        {max > 1
          ? `Esta experiencia permite hasta ${max} lugares por reservación.`
          : "Puedes llegar solo: la mayoría de las experiencias son de un lugar por persona."}
      </p>
    </div>
  );
}

/** Step 05: the loop closing. The pass renews Mondays — a real product rule, not a slogan. */
function ReturnVisual() {
  return (
    <div className="rounded-lg border border-carbon/10 bg-warm-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <RotateCcw aria-hidden size={16} strokeWidth={1.5} className="text-orange-ink" />
        <p className="text-small font-semibold text-carbon">Tu pase se renueva el lunes</p>
      </div>
      <ul className="mt-4 flex flex-col gap-2 text-small text-gray">
        <li>Un pase por semana, sin costo.</li>
        <li>Cancelas hasta 12 horas antes y lo recuperas.</li>
        <li>Cada semana se publican experiencias nuevas.</li>
      </ul>
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
    <InviteVisual key="invite" experience={experiences[0] ?? null} />,
    <CapacityVisual key="capacity" experience={experiences[0] ?? null} />,
    <PassVisual key="pass" />,
    <ReturnVisual key="return" />,
  ];

  return (
    <>
      {/* Desktop only: sticky scroll narrative. Coda pins chapters at `md:`
          and above and drops the behaviour below that — the same call is
          made here, and mobile gets the plain vertical sequence below
          rather than an inflated scroll container (brief §18). */}
      <div ref={containerRef} className="relative hidden lg:block" style={{ height: `${STEPS.length * 50}vh` }}>
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
                <span className="text-4xl font-semibold text-orange-ink">{step.number}</span>
                <h3 className="mt-3 text-subtitle">{step.title}</h3>
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
            <span className="text-4xl font-semibold text-orange-ink">{step.number}</span>
            <h3 className="mt-3 text-subtitle">{step.title}</h3>
            <p className="mt-2 max-w-sm text-gray">{step.body}</p>
            <div className="mt-5">{visuals[i]}</div>
          </InViewReveal>
        ))}
      </div>
    </>
  );
}
