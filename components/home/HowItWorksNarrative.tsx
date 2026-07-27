"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { CATEGORIES } from "@/lib/constants";

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

function CatalogVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.slice(0, 4).map((c) => (
        <div key={c.value} className="flex h-24 flex-col justify-end rounded-xl bg-gradient-to-br from-sunny/40 to-orange/30 p-3">
          <span className="text-xs font-semibold text-carbon">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function CapacityVisual() {
  return (
    <div className="rounded-xl border border-carbon/10 bg-warm-white p-5">
      <div className="flex items-center justify-between">
        <span className="font-serif text-lg italic">Tu experiencia</span>
        <span className="rounded-full bg-sunny px-3 py-1 text-xs font-semibold">3 lugares</span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-carbon/10">
        <div className="h-full w-[70%] rounded-full bg-orange" />
      </div>
      <p className="mt-2 text-xs text-gray">7 de 10 lugares reservados</p>
    </div>
  );
}

function PassVisual() {
  return (
    <div className="rounded-xl border border-carbon/10 bg-carbon p-5 text-warm-white">
      <p className="text-xs tracking-widest text-warm-white/60 uppercase">Pase Sunny</p>
      <p className="mt-2 font-mono text-lg tracking-wide">SUN-2026-XXXXXX</p>
      <div className="mt-4 h-px w-full bg-warm-white/15" />
      <p className="mt-4 text-sm text-warm-white/80">Presenta tu nombre y folio al llegar.</p>
    </div>
  );
}

const VISUALS = [CatalogVisual, CapacityVisual, PassVisual];

export function HowItWorksNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length));
    setActive(idx);
  });

  const ActiveVisual = VISUALS[active];

  return (
    <>
      {/* Desktop: sticky scroll narrative */}
      <div ref={containerRef} className="relative hidden lg:block" style={{ height: `${STEPS.length * 70}vh` }}>
        <div className="sticky top-24 mx-auto grid max-w-6xl grid-cols-[2px_1fr_1fr] gap-12 px-8">
          <div className="relative h-[50vh] self-center rounded-full bg-carbon/10">
            <motion.div
              className="absolute inset-x-0 top-0 origin-top rounded-full bg-orange"
              style={{ scaleY: scrollYProgress, height: "100%" }}
            />
          </div>

          <div className="flex flex-col justify-center gap-12">
            {STEPS.map((step, i) => (
              <div key={step.number} className={clsx("transition-opacity duration-500", active === i ? "opacity-100" : "opacity-30")}>
                <span className="font-serif text-5xl text-orange">{step.number}</span>
                <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-sm text-gray">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <ActiveVisual />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked reveal */}
      <div className="flex flex-col gap-14 lg:hidden">
        {STEPS.map((step, i) => {
          const Visual = VISUALS[i];
          return (
            <InViewReveal key={step.number}>
              <span className="font-serif text-5xl text-orange">{step.number}</span>
              <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-sm text-gray">{step.body}</p>
              <div className="mt-6">
                <Visual />
              </div>
            </InViewReveal>
          );
        })}
      </div>
    </>
  );
}
