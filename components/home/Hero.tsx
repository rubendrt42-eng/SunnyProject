import Link from "next/link";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { FloatingChip } from "@/components/motion/FloatingChip";
import { LinkButton } from "@/components/ui/Button";
import { HeroFeaturedCard } from "@/components/home/HeroFeaturedCard";
import { categoryLabel } from "@/lib/constants";
import { spotsLeft } from "@/lib/experience-status";
import type { ExperienceWithBusiness } from "@/lib/queries";

export function Hero({ featured }: { featured: ExperienceWithBusiness | null }) {
  const left = featured ? spotsLeft(featured, featured.reserved_count) : 0;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden rounded-b-[2rem] text-warm-white sm:rounded-b-[3rem]">
      <ParallaxImage
        src={featured?.image_url || "/images/placeholder-2.svg"}
        alt=""
        priority
        strength={0.06}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/85 via-carbon/20 to-carbon/55" />

      {featured && (
        <div className="absolute inset-x-0 top-0 mx-auto flex w-full max-w-6xl flex-wrap gap-3 px-5 pt-24 sm:px-8 sm:pt-28">
          <FloatingChip delay={1.1}>{categoryLabel(featured.category)}</FloatingChip>
          {left > 0 && (
            <FloatingChip delay={1.2}>
              {left} {left === 1 ? "lugar disponible" : "lugares disponibles"}
            </FloatingChip>
          )}
        </div>
      )}

      <div className="relative mx-auto mt-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-16 sm:px-8 sm:pb-20 lg:flex-row lg:items-end lg:justify-between lg:pb-24">
        <div className="max-w-xl">
          <WordReveal
            as="h1"
            text="TU PRÓXIMA EXPERIENCIA EMPIEZA AQUÍ"
            className="font-serif text-5xl leading-[0.98] italic sm:text-7xl lg:text-8xl"
          />
          <LineReveal delay={0.7}>
            <p className="mt-6 max-w-md text-lg text-warm-white/90">
              Descubre movimiento, recovery, cafés, outdoor y comunidad con cupos limitados en Monterrey.
            </p>
          </LineReveal>
          <LineReveal delay={0.9}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LinkButton href="/experiencias" size="lg" variant="secondary">
                Explorar experiencias
              </LinkButton>
              <Link
                href="/como-funciona"
                className="rounded-full border border-warm-white/50 px-8 py-4 text-base font-medium text-warm-white transition-colors hover:bg-warm-white/10"
              >
                Cómo funciona
              </Link>
            </div>
          </LineReveal>
        </div>

        {featured && <HeroFeaturedCard experience={featured} />}
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-warm-white/70 sm:flex">
        <span className="text-xs tracking-widest uppercase">Descubre más</span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 motion-safe:animate-bounce">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    </section>
  );
}
